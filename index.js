#! /usr/bin/env node

const sh = require("shelljs");
const cwd = sh.pwd().toString();
const path = require('path');
const fs = require('fs');
const colors = require('colors');
const globule = require('globule');
const argv = require('optimist').argv;
const pkg = require('./package.json');
const { mdRegex, processFiles } = require('./lib/process');
let aborted = false;

let bannerVersion = `${pkg.name} v${pkg.version}`;
let bannerWidth = 38;
let banner = `
 ----------------------------------------
| ====================================== |
| ==============  ==  ================== |
| ==============  ==  ================== |
| ==  ==========  ==  ================== |
| =    ===   ===  ==  =  ===   ====   == |
| ==  ===  =  ==  ==    ===  =  ==  =  = |
| ==  ======  ==  ==   =====  ====  =  = |
| ==  ====    ==  ==    =====  ===  =  = |
| ==  ===  =  ==  ==  =  ==  =  ==  =  = |
| ==   ===    ==  ==  =  ===   ====   == |
| ====================================== |
| ${' '.repeat(bannerWidth - bannerVersion.length)}${bannerVersion} |
 ${'-'.repeat(bannerWidth + 2)}
`;
console.log(banner);

if (argv.e || argv.example) {
  fs.createReadStream(`${__dirname}/example.md`).pipe(fs.createWriteStream(`${cwd}/example.md`));
  console.log(`created example.md`.yellow);
  return;
}

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

    console.log(`start watching files`.yellow);
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

    console.log(`start processing files`.yellow);
    for (let file of files) {
      await processFiles(file);
    }
    console.log(`finish processing files`.yellow);
  }
})();
