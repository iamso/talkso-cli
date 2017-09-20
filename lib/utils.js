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

module.exports = {
  sleep,
  leadingZero,
};
