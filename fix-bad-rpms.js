const stream = require('stream');
const _ = require("lodash");


class FixBadRPMs extends stream.Transform {
    constructor() {
        super({objectMode: true});

        this.processHeader = true;

        this.colIndex = undefined;
    }

    _transform(data, encoding, done) {
        if (this.processHeader) {
            // write header
            const buf = this.writeHeader(data);
            this.push(buf);
            this.processHeader = false;
        } else {
            const buf = this.writeRow(data);
            this.push(buf);
        }

        done();
    }

    _flush(done) {
        done();
    }

    writeHeader(columnNames) {
        return _.map(columnNames, (column, index) => {
            if (column.startsWith("RPM")) {
                this.colIndex = index;
            }
            return column;
        });
    }

    writeRow(row) {
        let newRow = row.slice(0, row.length)
        if (newRow[this.colIndex] > 32767) {
            newRow[this.colIndex] -= 65536
        }
        newRow[this.colIndex] *= -1
        return newRow
    }
}

module.exports = () => new FixBadRPMs()