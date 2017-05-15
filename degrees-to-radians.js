const stream = require('stream');
const _ = require('lodash');
const BN = require('bn.js');

class DegreesToRadians extends stream.Transform {
  constructor() {
    super({objectMode: true});

    this.processHeader = true;

    this.latIndex = undefined;
    this.lonIndex = undefined;
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
      if (column.startsWith('Latitude')) {
        this.latIndex = index;
        return 'Latitude';
      }

      if (column.startsWith('Longitude')) {
        this.lonIndex = index;
        return 'Longitude';
      }

      return column;
    });
  }

  writeRow(row) {
    let newRow = row.slice(0, row.length);

    if (this.latIndex == this.lonIndex) {
      console.error('wtf');
    }

    if (this.latIndex) {
      newRow[this.latIndex] = this.degreesToRadians(row[this.latIndex], row, this.latIndex, this.lonIndex);
    }

    if (this.lonIndex) {
      newRow[this.lonIndex] = this.degreesToRadians(row[this.lonIndex], row, this.latIndex, this.lonIndex);
    }

    return newRow;
  }

  degreesToRadians(degrees, row) {
    let radians = degrees * Math.PI / 180.0;
    if (radians < 0.5 && radians > 0) {
      console.log(radians, degrees);
      console.log(this.latIndex, this.lonIndex);
    }
    return radians;
  }
}
 
module.exports = () => new DegreesToRadians();