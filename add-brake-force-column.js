const stream = require('stream');

const FRONT_FORCE_CONSTANT = 3.14159
const REAR_FORCE_CONSTANT = 1.57080

class AddBrakeForceColumn extends stream.Transform {
    constructor() {
        super({objectMode: true});
        this.frontPressureCol = undefined;
        this.rearPressureCol = undefined;
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
        columnNames.push("FrontBrakeForce [lbf]")
        columnNames.push("RearBrakeForce [lbf]")

        this.frontPressureCol = columnNames.findIndex(c => c.startsWith("FrontBrake"));
        this.rearPressureCol = columnNames.findIndex(c => c.startsWith("RearBrake"));

        return columnNames
    }

    writeRow(row) {
        let newRow = row.slice(0, row.length);

        if (this.frontPressureCol && this.rearPressureCol) {
            newRow.push(row[this.frontPressureCol]*FRONT_FORCE_CONSTANT);
            newRow.push(row[this.rearPressureCol]*REAR_FORCE_CONSTANT);
        }

        return newRow;
    }

}

module.exports = () => new AddBrakeForceColumn()