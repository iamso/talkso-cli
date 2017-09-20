const fs = require('fs');
const request = require('./lib/request');

const files = [
  'https://raw.githubusercontent.com/iamso/talkso/master/talkso.css',
  'https://raw.githubusercontent.com/iamso/talkso/master/talkso.js',
];

const dir = `${__dirname}/client`;

(async () => {

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  for (let file of files) {
    const content = await request.get(file);
    const fileName = file.split('/').pop();
    fs.writeFileSync(`${dir}/${fileName}`, content);
  }
})();
