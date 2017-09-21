const sh = require("shelljs");
const cwd = sh.pwd().toString();
const colors = require('colors');
const argv = require('optimist').argv;
const express = require('express');
const serveIndex = require('serve-index');
const port = process.env.PORT || argv.p || argv.port || 8000;

module.exports = () => {
  return new Promise(resolve => {
    const app = express();
    app.use(serveIndex(cwd, {'icons': true}));
    app.use(express.static(cwd));
    app.listen(port, () => {
      const url = `http://localhost:${port}`;
      resolve({url, port});
    });
  });
};
