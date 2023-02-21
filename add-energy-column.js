const stream = require('stream');


class AddEnergyColumn extends stream.Transform {
    constructor() {
        super({objectMode: true});

        this.processHeader = true;
        this.powerCol = undefined;
        this.intervalCol = undefined;
        this.energyCol = undefined;
        this.lastPower = undefined;
        this.lastInterval = undefined;
        this.totalEnergy = 0;
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
        columnNames.push("EnergyUsed [J]")
        this.powerCol = columnNames.findIndex(c => c.startsWith("Power"));
        this.intervalCol = columnNames.findIndex(c => c.startsWith("Interval"));
        this.energyCol = columnNames.length - 1;

        return columnNames
    }

    writeRow(row) {
        let newRow = row.slice(0, row.length);

        if (this.powerCol !== -1 && this.energyCol !== -1 && this.intervalCol !== -1) {
            if (this.lastPower !== undefined && this.lastInterval !== undefined) {
                this.totalEnergy += (this.lastPower + row[this.powerCol])/2 * (row[this.intervalCol] - this.lastInterval)/1000
            }
        }
        this.lastPower = row[this.powerCol]
        this.lastInterval = row[this.intervalCol]
        newRow.push(this.totalEnergy);

        // console.log(this.lastPower, this.lastInterval, row[this.powerCol], row[this.intervalCol], ((this.lastPower + row[this.powerCol])/2) * ((row[this.intervalCol] - this.lastInterval)/1000), this.totalEnergy)
        return newRow;
    }

}

module.exports = () => new AddEnergyColumn()