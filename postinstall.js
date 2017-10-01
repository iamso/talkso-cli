const fs = require('fs');
const path = require('path');
const colors = require('colors');
const logUpdate = require('log-update');
const request = require('./lib/request');

const files = [
  'https://raw.githubusercontent.com/iamso/talkso/master/talkso.css',
  'https://raw.githubusercontent.com/iamso/talkso/master/talkso.js',
];
const dir = `${__dirname}/client`;
const dirName = path.basename(dir);

const frames = ['—', '\\', '|', '/'];
let i = 0;

(async () => {

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  let logInterval = setInterval(() => {
    const frame = frames[i = ++i % frames.length];
    logUpdate(`${frame} updating client`.bold);
  }, 100);

  for (let file of files) {
    const content = await request.get(file);
    const fileName = path.basename(file);
    fs.writeFileSync(`${dir}/${fileName}`, content);
  }
  clearInterval(logInterval);
  logUpdate(`→ client updated`.bold);
  logUpdate.done();
})();
