const stream = require('stream');


class AddPowerColumn extends stream.Transform {
    constructor() {
        super({objectMode: true});

        this.processHeader = true;
        this.powerCol = undefined;
        this.voltageCol = undefined;
        this.currentCol = undefined;
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
        columnNames.push("Power [W]");
        this.powerCol = columnNames.length - 1;
        this.voltageCol = columnNames.findIndex(c => c.startsWith("Pack_Inst_V"));
        this.currentCol = columnNames.findIndex(c => c.startsWith("PackCurrent"));

        return columnNames
    }

    writeRow(row) {
        let newRow = row.slice(0, row.length);


        if (this.voltageCol && this.powerCol) {
            newRow.push(row[this.voltageCol]*row[this.currentCol]);
        }

        return newRow;
    }

}

module.exports = () => new AddPowerColumn()