const sh = require("shelljs");
const cwd = sh.pwd().toString();
const colors = require('colors');
const argv = require('optimist').argv;
const express = require('express');
const serveIndex = require('serve-index');
const interceptor = require('express-interceptor');
const reload = require('reload');
const port = process.env.PORT || argv.p || argv.port || 8000;

module.exports = (useReload = false) => {
  return new Promise(resolve => {
    const app = express();
    let reloadServer;

    if (useReload) {
      const injectReload  = interceptor((req, res) => {
        return {
          isInterceptable: () => {
            return /text\/html/.test(res.get('Content-Type'));
          },
          intercept: (body, send) => {
            send(body.replace('</body>', '<script src="/reload/reload.js"></script></body>'));
          }
        };
      });

      // Add the interceptor middleware
      app.use(injectReload);
      reloadServer = reload(app);
    }

    app.use(express.static(cwd));
    app.use(serveIndex(cwd, {'icons': true}));

    app.listen(port, () => {
      const url = `http://localhost:${port}`;
      resolve({url, port, reloadServer});
    });
  });
};
