const stream = require('stream');

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};
class AddBrakeBiasColumn extends stream.Transform {
    constructor() {
        super({objectMode: true});
        this.frontForceCol = undefined;
        this.rearForceCol = undefined;
        this.processHeader = true;
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
        columnNames.push("BrakeBias [%]")

        this.frontForceCol = columnNames.findIndex(c => c.startsWith("FrontBrakeForce"));
        this.rearForceCol = columnNames.findIndex(c => c.startsWith("RearBrakeForce"));

        return columnNames
    }

    writeRow(row) {
        let newRow = row.slice(0, row.length);

        if (this.frontForceCol && this.rearForceCol && row[this.frontForceCol] > 50 && row[this.frontForceCol] > 50) {
            var brakeBiasPct = 100*row[this.frontForceCol] / (row[this.frontForceCol] + row[this.rearForceCol]);
            newRow.push(brakeBiasPct.clamp(0,100));
        } else {
            newRow.push(0);
        }

        return newRow;
    }

}

module.exports = () => new AddBrakeBiasColumn()