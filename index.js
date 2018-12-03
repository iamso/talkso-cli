#! /usr/bin/env node

const pkg = require('./package.json');
const colors = require('colors');
const argv = require('optimist').argv;

const hasOption = (option) => {
  return argv[option.substr(0,1)] || argv[option] || argv._.indexOf(option) > -1;
}

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

if (hasOption('version')) {
  return;
}

if (hasOption('help')) {
  console.log(`${'usage:'.yellow}
if no argument is passed, it will create a pdf of the html files in the folder.

${'-e, --example'.bold}   create example.md
${'-u, --update'.bold}    update the client files
${'-s, --serve'.bold}     start serving the files
${'-z, --zip'.bold}       create a zip file ${'(only if not serving)'.dim}
${'-d, --deploy'.bold}    create folder for deployment ${'(only if not serving)'.dim}
${'-p, --pdf'.bold}       create pdf from screenshots ${'(only if not serving)'.dim}
${'-v, --version'.bold}   show the version ot talkso-cli
${'-h, --help'.bold}      show this helpful information
`);
  return;
}

const sh = require("shelljs");
const cwd = sh.pwd().toString();
const path = require('path');
const fs = require('fs');

if (hasOption('example')) {
  fs.createReadStream(`${__dirname}/client/demo.html`).pipe(fs.createWriteStream(`${cwd}/example.html`));
  console.log(`created example.html`.yellow);
  return;
}

const { runScript } = require('./lib/utils');
const copyClient = overwrite => {
  (overwrite || !fs.existsSync(`${cwd}/talkso.css`)) && fs.createReadStream(`${__dirname}/client/talkso.css`).pipe(fs.createWriteStream(`${cwd}/talkso.css`));
  (overwrite || !fs.existsSync(`${cwd}/talkso.js`)) && fs.createReadStream(`${__dirname}/client/talkso.js`).pipe(fs.createWriteStream(`${cwd}/talkso.js`));
}

if (hasOption('update')) {
  console.log(`start updating cilent`.yellow);
  runScript(`${__dirname}/postinstall.js`).then(e => {
    copyClient(fs.existsSync(`${cwd}/talkso.css`) && fs.existsSync(`${cwd}/talkso.js`));
    console.log(`finish updating cilent`.yellow);
  }).catch(console.error);
  return;
}

const globule = require('globule');
const opn = require('opn');
const { processFiles, clearTemp } = require('./lib/process');
const serve = require('./lib/serve');
let aborted = false;

const files = globule.find(`${cwd}/*.+(html|htm)`);

if (files.length) {
  copyClient();
}
else {
  console.log(`no files to process`.yellow);
  process.exit(0);
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
  if (hasOption('serve')) {
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
    const pdf = true;
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
