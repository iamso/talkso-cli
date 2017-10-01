const childProcess = require('child_process');

function sleep(time = 2000) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

function leadingZero(value, length = 2) {
  value = ''+value;
  while (value.length < length) {
    value = `0${value}`;
  }
  return value;
}

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const process = childProcess.fork(scriptPath);
    process.on('error', (err) => {
      reject(err);
    });
    process.on('exit', (code) => {
      if (code === 0) {
        resolve();
      }
      else {
        reject(new Error('exit code ' + code));
      }
    });
  });
}

module.exports = {
  sleep,
  leadingZero,
  runScript,
};
