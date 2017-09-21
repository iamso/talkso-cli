#! /usr/bin/env node

const sh = require("shelljs");
const cwd = sh.pwd().toString();
const path = require('path');
const fs = require('fs');
const colors = require('colors');
const globule = require('globule');
const argv = require('optimist').argv;
const { mdRegex, processFiles } = require('./lib/process');
let aborted = false;

const files = globule.find(`${cwd}/*.md`);

if (files.length) {
  fs.createReadStream(`${__dirname}/client/talkso.css`).pipe(fs.createWriteStream(`${cwd}/talkso.css`));
  fs.createReadStream(`${__dirname}/client/talkso.js`).pipe(fs.createWriteStream(`${cwd}/talkso.js`));
}

process.on('SIGINT', function() {
  aborted = true;
  process.exit(0);
});

process.on('SIGTERM', function() {
  aborted = true;
  process.exit(0);
});

(async () => {
  if (argv.w || argv.watch) {
    process.on('exit', function() {
      if (aborted) {
        console.log('');
        console.log(`stop watching files`.yellow);
      }
    });

    console.log(`start watching ${cwd}`.yellow);
    for (let file of files) {
      await processFiles(file, false);
    }
    fs.watch(cwd, async (e, file) => {
      if (mdRegex.test(file) && !/.*\~\..*/.test(file)) {
        const mdFile = path.basename(file);
        console.log(`${mdFile} changed`.yellow);
        await processFiles(file, false);
      }
    });
  }
  else {
    process.on('exit', function() {
      if (aborted) {
        console.log('');
        console.log(`stop processing files`.yellow);
      }
    });

    console.log(`start processing ${cwd}`.yellow);
    for (let file of files) {
      await processFiles(file);
    }
    console.log(`finish processing ${cwd}`.green);
  }
})();
