const fs = require('fs');
const csv = require('fast-csv');

const cleanHeaders = require('./clean-headers');
const fillRows = require('./fill-rows');
const writeLog = require('./write-itlog');

function convert(filename, output) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(cleanHeaders())
      .pipe(csv())
      .pipe(fillRows())
      .pipe(writeLog())
      .pipe(fs.createWriteStream(output))
    
      .on("error", error => reject(error))
      .on("end", () => resolve());
  });
}

module.exports = convert;