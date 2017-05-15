const stream = require('stream');

class FillRows extends stream.Transform {
  constructor() {
    super({objectMode: true});

    this.processHeader = true;
  }

  _transform(row, encoding, done) {
    // passthrough the header
    if (this.processHeader) {
      this.processHeader = false;

      this.numColumns = row.length;

      this.filler = new Array(this.numColumns);
      this.filler.fill(0);
    } else {

      // fill the row
      for (let i = 0; i < this.numColumns; i++) {
        if (row[i] === '') {
          row[i] = this.filler[i];
        }
      }

      // the previous row automatically becomes next filler
      this.filler = row;
    }

    this.push(row);
    done();
  }

  _flush(done) {
    done();
  }

}
 
module.exports = () => new FillRows()