#! /usr/bin/env node

const pkg = require('./package.json');
const colors = require('colors');

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
 ${'https://github.com/iamso/talkso-cli'.dim}
`;
console.log(banner);

const sh = require("shelljs");
const cwd = sh.pwd().toString();
const path = require('path');
const fs = require('fs');
const globule = require('globule');
const argv = require('optimist').argv;
const opn = require('opn');
const { mdRegex, processFiles, clearTemp } = require('./lib/process');
const serve = require('./lib/serve');
const { runScript } = require('./lib/utils');
let aborted = false;

if (hasOption('help')) {
  console.log(`${'usage:'.yellow}
if no argument is passed, it will process the .md files and create HTML output.

${'-e, --example'.bold}   create example.md
${'-u, --update'.bold}    update the client files
${'-w, --watch'.bold}     start watching .md files
${'-s, --serve'.bold}     start serving the files
${'-z, --zip'.bold}       create a zip file ${'(only if not watching or serving)'.dim}
${'-d, --deploy'.bold}    create folder for deployment ${'(only if not watching or serving)'.dim}
${'-p, --pdf'.bold}       create pdf from screenshots ${'(only if not watching or serving)'.dim}
${'-h, --help'.bold}      show this helpful information
`);
  return;
}

if (hasOption('example')) {
  fs.createReadStream(`${__dirname}/example.md`).pipe(fs.createWriteStream(`${cwd}/example.md`));
  console.log(`created example.md`.yellow);
  return;
}

if (hasOption('update')) {
  console.log(`start updating cilent`.yellow);
  runScript(`${__dirname}/postinstall.js`).then(e => {
    if (fs.existsSync(`${cwd}/talkso.css`) && fs.existsSync(`${cwd}/talkso.js`)) {
      copyClient();
    }
    console.log(`finish updating cilent`.yellow);
  }).catch(console.error);
  return;
}

const files = globule.find(`${cwd}/*.md`);

if (files.length) {
  copyClient();
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
  if (hasOption('watch')) {
    process.on('exit', function() {
      if (aborted) {
        console.log('');
        console.log(`stop watching files`.yellow);
      }
    });

    const {url, port, reloadServer} = await serve(true);
    console.log(`start watching files`.yellow);
    console.log(`serving files at ${url}`.yellow.dim);
    for (let file of files) {
      await processFiles(file, false);
    }
    fs.watch(cwd, async (e, file) => {
      if (mdRegex.test(file) && !/.*\~\..*/.test(file)) {
        const mdFile = path.basename(file);
        console.log(`${mdFile} changed`.yellow);
        await processFiles(file, false);
        reloadServer.reload();
      }
    });
    opn(url);
  }
  else if (hasOption('serve')) {
    process.on('exit', function() {
      if (aborted) {
        console.log('');
        console.log(`stop serving files`.yellow);
      }
    });

    const {url, port} = await serve();
    console.log(`start serving files at ${url}`.yellow);
    opn(url);
  }
  else {
    const zip = hasOption('zip');
    const deploy = hasOption('deploy');
    const pdf = hasOption('pdf');
    process.on('exit', function() {
      if (aborted) {
        console.log('');
        console.log(`→ clear temp files`.bold);
        for (let file of files) {
          clearTemp(file);
        }
        console.log(`stop processing files`.yellow);
      }
    });

    console.log(`start processing files`.yellow);
    for (let file of files) {
      await processFiles(file, pdf, zip, deploy);
    }
    console.log(`finish processing files`.yellow);
  }
})();

function hasOption(option) {
  return argv[option.substr(0,1)] || argv[option] || argv._.indexOf(option) > -1;
}

function copyClient() {
  fs.createReadStream(`${__dirname}/client/talkso.css`).pipe(fs.createWriteStream(`${cwd}/talkso.css`));
  fs.createReadStream(`${__dirname}/client/talkso.js`).pipe(fs.createWriteStream(`${cwd}/talkso.js`));
}
