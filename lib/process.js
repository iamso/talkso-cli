const path = require('path');
const fs = require('fs');
const os = require('os');
const uniqueFilename = require('unique-filename');

const colors = require('colors');
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const im = require('imagemagick');
const rimraf = require('rimraf');
const logUpdate = require('log-update');
const archiver = require('archiver');
const globule = require('globule');
const slug = require('slug');
const { sleep, leadingZero } = require('./utils');

const fileRegex = /\.(html|htm)$/;
const spinnerFrames = ['—', '\\', '|', '/'];

let lastTmpDir;

async function processFiles(file, pdf = true, zip = false, deploy = false) {
  return new Promise(async resolve => {
    const pdfPath = file.replace(fileRegex, '.pdf');
    const htmlFile = path.basename(file);
    const pdfFile = path.basename(pdfPath);
    const tmpDir = lastTmpDir = uniqueFilename(os.tmpdir());

    let processResolve;
    let processPromise = new Promise(resolve => {
      processResolve = resolve;
    });

    console.log(`→ start processing ${htmlFile}`.bold);

    rimraf.sync(pdfPath);

    if (pdf) {
      if (!fs.existsSync(tmpDir)){
        fs.mkdirSync(tmpDir);
      }

      const url = `file://${file}?notrans`;
      const html = fs.readFileSync(file);

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
      await page.goto(`${url}#1.0`, {waitUntil: 'networkidle2'});

      for (let section of sections) {
        const index = sections.indexOf(section) + 1;
        const steps = section.querySelectorAll('.step').length;
        const number = `${leadingZero(index, `${sections.length}`.length)}.${steps}`;

        if (index > 1) {
          for (let ii = 0; ii < steps + 1; ii++) {
            await sleep(10);
            page.keyboard.press('ArrowRight');
          }
        }

        await sleep(10);
        await page.screenshot({path: `${tmpDir}/${number}.jpg`});
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

      im.convert([`${tmpDir}/*.jpg`, pdfPath], async (err, stdout) => {
        if (err) throw err;
        rimraf.sync(tmpDir);
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
    console.log(`→ finish processing ${htmlFile}`.bold);
    resolve();
  });
}

async function zipFiles(file) {
  return new Promise(async resolve => {
    const pdfPath = file.replace(fileRegex, '.pdf');
    const zipPath = file.replace(fileRegex, '.zip');
    const dirPath = file.replace(fileRegex, '');
    const dirName = path.dirname(file);
    const fileName = path.basename(dirPath);

    rimraf.sync(zipPath);

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
    const dirPath = file.replace(fileRegex, '');
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
  // const dirPath = `${file.replace(fileRegex, '')} temp`;
  if (fs.existsSync(lastTmpDir)){
    rimraf.sync(lastTmpDir);
  }
}

module.exports = {
  fileRegex,
  spinnerFrames,
  processFiles,
  clearTemp,
};
