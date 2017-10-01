const path = require('path');
const fs = require('fs');
const colors = require('colors');
const md = require('motes-md')({
  containers: [
    'fullscreen',
  ]
});
const ejs = require('ejs');
const template = fs.readFileSync(`${__dirname}/../views/template.ejs`, 'utf-8');

const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const im = require('imagemagick');
const rimraf = require('rimraf');
const logUpdate = require('log-update');
const archiver = require('archiver');
const globule = require('globule');
const slug = require('slug');
const request = require('./request');
const { sleep, leadingZero } = require('./utils');

const mdRegex = /\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text|md)$/;
const spinnerFrames = ['—', '\\', '|', '/'];

md.use(require('markdown-it-container'), 'section', {

  validate: function(params) {
    return params.trim().match(/^section/);
  },

  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      const classes = tokens[idx].info.trim().match(/^section\s*(.*)$/)[1];
      // opening tag
      return `<section class="${classes}">\n`;

    } else {
      // closing tag
      return '</section>\n';
    }
  }
});
md.use(require('markdown-it-container'), 'notes', {

  validate: function(params) {
    return params.trim().match(/^notes/);
  },

  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      // opening tag
      return `<details>\n`;

    } else {
      // closing tag
      return '</details>\n';
    }
  }
});

async function processFiles(file, pdf = true, zip = false, deploy = false) {
  return new Promise(async resolve => {
    const htmlPath = file.replace(mdRegex, '.html');
    const pdfPath = file.replace(mdRegex, '.pdf');
    const zipPath = file.replace(mdRegex, '.zip');
    const dirPath = `${file.replace(mdRegex, '')} temp`;
    const mdFile = path.basename(file);
    const htmlFile = path.basename(htmlPath);
    const pdfFile = path.basename(pdfPath);
    const markdown = fs.readFileSync(file, 'utf-8');
    const html = ejs.render(template, {html: md.render(markdown)});

    let processResolve;
    let processPromise = new Promise(resolve => {
      processResolve = resolve;
    });

    console.log(`→ start processing ${mdFile}`.bold);

    rimraf.sync(htmlPath);
    rimraf.sync(dirPath);
    rimraf.sync(pdfPath);
    rimraf.sync(zipPath);

    fs.writeFileSync(htmlPath, html);

    console.log(`  ⇢ ${htmlFile} created`);

    if (pdf) {
      if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
      }

      const url = `file://${htmlPath}?notrans`;

      const dom = new JSDOM(html);
      const sections = [].slice.call(dom.window.document.querySelectorAll('section'), 0);
      const pages = [];

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const progressMax = 20;
      let progressCurrent = 0;
      let lastIndex = 0;
      let i = 0;

      let logInterval = setInterval(() => {
        const frame = spinnerFrames[i = ++i % spinnerFrames.length];
        logUpdate(` ${frame} screenshots [${'='.repeat(progressCurrent)}${' '.repeat(progressMax - progressCurrent)}] ${lastIndex}/${sections.length}`);
      }, 100);

      page.setViewport({width: 1440, height: 900, deviceScaleFactor: 2});
      await page.goto(`${url}#1.0`, {waitUntil: 'networkidle'});

      for (let section of sections) {
        const index = sections.indexOf(section) + 1;
        const steps = section.querySelectorAll('.step').length;
        const number = `${leadingZero(index, `${sections.length}`.length)}.${steps}`;

        if (index > 1) {
          for (let ii = 0; ii < steps + 1; ii++) {
            await sleep(10);
            page.press('ArrowRight');
          }
        }

        await sleep(10);
        await page.screenshot({path: `${dirPath}/${number}.jpg`});
        progressCurrent = Math.floor(index/sections.length * progressMax);
        lastIndex = index;
      }

      clearInterval(logInterval);
      logUpdate(` ⇢ screenshots [${'='.repeat(progressCurrent)}${' '.repeat(progressMax - progressCurrent)}] ${lastIndex}/${sections.length}`);
      logUpdate.done();

      i = 0;
      logInterval = setInterval(() => {
        const frame = spinnerFrames[i = ++i % spinnerFrames.length];
        logUpdate(` ${frame} creating pdf`);
      }, 100);

      await browser.close();

      im.convert([`${dirPath}/*.jpg`, pdfPath], async (err, stdout) => {
        if (err) throw err;
        rimraf.sync(dirPath);
        clearInterval(logInterval);
        logUpdate.clear();
        console.log(`  ⇢ ${pdfFile} created`);
        processResolve();
      });
    }
    else {
      processResolve();
    }

    await processPromise;
    if (zip) {
      await zipFiles(file);
    }
    if (deploy) {
      await createDeploy(file);
    }
    console.log(`→ finish processing ${mdFile}`.bold);
    resolve();
  });
}

async function zipFiles(file) {
  return new Promise(async resolve => {
    const htmlPath = file.replace(mdRegex, '.html');
    const pdfPath = file.replace(mdRegex, '.pdf');
    const zipPath = file.replace(mdRegex, '.zip');
    const dirPath = file.replace(mdRegex, '');
    const dirName = path.dirname(file);
    const fileName = path.basename(dirPath);
    const zipFile = path.basename(zipPath);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });
    const files = globule.find(`${dirPath}.!(md|zip)`, `${dirName}/talkso.{js,css}`);

    let i = 0;
    let logInterval = setInterval(() => {
      const frame = spinnerFrames[i = ++i % spinnerFrames.length];
      logUpdate(` ${frame} zipping files`);
    }, 100);

    archive.pipe(output);

    for (let f of files) {
      archive.file(f, { name: path.basename(f) });
    }

    archive.finalize();

    clearInterval(logInterval);
    logUpdate.clear();
    console.log(`  ⇢ ${zipFile} created`);
    resolve();
  });
}

async function createDeploy(file) {
  return new Promise(async resolve => {
    const dirPath = file.replace(mdRegex, '');
    const dirName = path.dirname(file);
    const fileName = path.basename(dirPath);
    const files = globule.find(`${dirPath}.!(md|zip)`, `${dirName}/talkso.{js,css}`);

    rimraf.sync(dirPath);
    fs.mkdirSync(dirPath);

    let i = 0;
    let logInterval = setInterval(() => {
      const frame = spinnerFrames[i = ++i % spinnerFrames.length];
      logUpdate(` ${frame} copying files`);
    }, 100);

    for (let f of files) {
      let fDir = path.dirname(f);
      let fName = path.basename(f);

      if (/\.html$/.test(fName)) {
        fName = 'index.html';
      }
      else if (/\.pdf$/.test(fName)) {
        fName = 'slides.pdf';
      }
      else if (/\.zip$/.test(fName)) {
        fName = 'download.zip';
      }
      fs.createReadStream(f).pipe(fs.createWriteStream(`${dirPath}/${fName}`));
    }

    clearInterval(logInterval);
    logUpdate.clear();
    console.log(`  ⇢ ${fileName} created`);
    resolve();
  });
}

function clearTemp(file) {
  const dirPath = `${file.replace(mdRegex, '')} temp`;
  rimraf.sync(dirPath);
}

module.exports = {
  mdRegex,
  spinnerFrames,
  processFiles,
  clearTemp,
};
