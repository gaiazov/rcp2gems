const stream = require('stream');
const _ = require('lodash');
const BN = require('bn.js');

class WriteLog extends stream.Transform {
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
      const buf = this.writeRow(data);
      this.push(buf);
    }

    done();
  }
   
  _flush(done) {
    done();
  }

  writeHeader(columnNames) {
    // we have to include 2 new columns
    const columns = ['TimeLow [us/10]', 'TimeHigh [us/10]'].concat(columnNames);

    // each column takes column.length + 1 bytes. The 1 byte is for writing column length.
    const columnNameBytes = _.sumBy(columns, column => column.length + 1);

    // 12 bytes for constant length header
    // columnNameBytes for column names
    // 1 byte is for writing 0x0 terminator
    const buf = Buffer.allocUnsafe(12 + columnNameBytes + 1);

    let offset = 0;

    // now actually write the header

    // pretty sure this means Low Endian. Have not tried Big Endian
    buf.write("L-LE", offset);
    offset += 4;

    // this is a magic number
    buf.writeUInt32LE(0x204, offset);
    offset += 4;

    // number of columns needs to be written twice for some reason
    buf.writeUInt16LE(columns.length, offset);
    offset += 2;
    buf.writeUInt16LE(columns.length, offset);
    offset += 2;
    
    for (const column of columns) {
      const len = column.length;

      buf.writeInt8(len, offset);
      offset += 1;

      buf.write(column, offset);
      offset += len;
    }

    buf.writeInt8(0x0, offset);


    return buf;
  }

  writeRow(row) {
    let timestamp = this.getTimestamp(row);

    if (_.isUndefined(this.startTime)) {
      this.startTime = timestamp.clone();
    }

    timestamp = timestamp.sub(this.startTime);

    let us10 = timestamp.mul(new BN(10000)); // from ms to us/10

    // timestamp has to be split into high 32 and low 32 bytes
    const low = us10.maskn(32).toNumber();
    const high = us10.shrn(32).toNumber();

    // lets actually write the row now
    const buf = Buffer.allocUnsafe(4 * (row.length + 2)); // the + 2 is for low and high time

    let offset = 0;

    // low and high are written as ints
    buf.writeUInt32LE(low, offset);
    offset += 4;

    buf.writeUInt32LE(high, offset);
    offset += 4;

    // everything else is written as 32 bit floats
    for (const channel of row) {
      buf.writeFloatLE(channel, offset);
      offset += 4;
    }

    return buf;
  }

  getTimestamp(row) {
    // currently expect the first row to be time in ms
    return new BN(row[0]);
  }
}
 
module.exports = () => new WriteLog()