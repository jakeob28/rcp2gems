const fs = require('fs');
const csv = require('fast-csv');

const cleanHeaders = require('./clean-headers');
const fillRows = require('./fill-rows');
const writeLog = require('./write-itlog');
const degreesToRadians = require('./degrees-to-radians');
const fixBadCurrents = require('./fix-bad-currents');

function convert(filename, output) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filename)
            .pipe(cleanHeaders())
            .pipe(csv())
            .pipe(fillRows())
            .pipe(degreesToRadians())
            .pipe(fixBadCurrents())
            .pipe(writeLog())
            .pipe(fs.createWriteStream(output))

            .on("error", error => reject(error))
            .on("end", () => resolve());
    });
}

module.exports = convert;