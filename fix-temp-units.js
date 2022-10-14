const stream = require('stream');
const _ = require("lodash");


class FixTempUnits extends stream.Transform {
    constructor() {
        super({objectMode: true});

        this.processHeader = true;
    }

    _transform(data, encoding, done) {
        if (this.processHeader) {
            // write header
            const buf = this.writeHeader(data);
            this.push(buf);
            this.processHeader = false;
        } else {
            this.push(data);
        }

        done();
    }

    _flush(done) {
        done();
    }

    writeHeader(columnNames) {
        return _.map(columnNames, (column) => {
            if (column.startsWith("MotorTemp") || column.startsWith("InvTemp")) {
                console.log(column.replace("\[F\]", "[C]"))
                return column.replace("\[F\]", "[C]");
            }
            return column;
        });
    }
}

module.exports = () => new FixTempUnits()