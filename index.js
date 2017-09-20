#! /usr/bin/env node

const sh = require("shelljs");
const cwd = sh.pwd().toString();
const path = require('path');
const fs = require('fs');
const colors = require('colors');
const globule = require('globule');
const nodemon = require('nodemon');
const argv = require('optimist').argv;
const md = require('motes-md')({
  containers: [
    'fullscreen',
  ]
});
const ejs = require('ejs');
const template = fs.readFileSync(`${__dirname}/views/template.ejs`, 'utf-8');

const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const im = require('imagemagick');
const rimraf = require('rimraf');
const request = require('./lib/request');
const { sleep, leadingZero } = require('./lib/utils');

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

(async () => {
  const files = globule.find(`${cwd}/*.md`);

  if (files.length) {
    fs.createReadStream(`${__dirname}/client/talkso.css`).pipe(fs.createWriteStream(`${cwd}/talkso.css`));
    fs.createReadStream(`${__dirname}/client/talkso.js`).pipe(fs.createWriteStream(`${cwd}/talkso.js`));
  }

  for (let file of files) {
    const fileName = file.replace(/\.md$/, '.html');
    const dirName = file.replace(/\.md$/, '');
    const f = fileName.split('/').pop();
    const markdown = fs.readFileSync(file, 'utf-8');
    const html = ejs.render(template, {html: md.render(markdown)});

    fs.writeFileSync(fileName, html);

    if (!fs.existsSync(dirName)){
      fs.mkdirSync(dirName);
    }

    const url = `file://${fileName}`;

    const dom = new JSDOM(html);
    const sections = [].slice.call(dom.window.document.querySelectorAll('section'), 0);
    const pages = [];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setViewport({width: 2880, height: 1800});

    await page.goto(`${url}#1.0`, {waitUntil: 'networkidle'});

    for (let section of sections) {
      const index = sections.indexOf(section) + 1;
      const steps = section.querySelectorAll('.step').length;
      const number = `${leadingZero(index, `${sections.length}`.length)}.${steps}`;

      if (index > 1) {
        for (let ii = 0; ii < steps + 1; ii++) {
          await sleep(100);
          page.press('ArrowRight');
        }
      }

      await sleep(1500);
      await page.screenshot({path: `${dirName}/${number}.jpg`});
      console.log(`${f}#${number}`);
    }

    await browser.close();

    im.convert([`${dirName}/*.jpg`, `${dirName}.pdf`], (err, stdout) => {
      if (err) throw err;
      rimraf.sync(dirName);
    });
  }
})();
