const stream = require('stream');
const _ = require('lodash');
const unquote = require('unquote');

class CleanHeaders extends stream.Transform {
  constructor() {
    super({objectMode: true});

    this.done = false;
    this.header = "";
  }

  _transform(buffer, encoding, done) {
    // once the header has been cleaned up, this just passes through
    if (this.done) {
      this.push(buffer);
      done();
      return;
    }

    let cur = 0;

    for (const d of buffer) {
      const c = String.fromCharCode(d);

      // once we find the newline character,
      // the "this.header" will contain the first line
      if (c == '\n') {
        this.done = true;

        this.push(escapeHeaders(this.header));

        // anything past this is the remainder and we can just pass it through
        const remainder = buffer.slice(cur);
        this.push(remainder);

        done();
        return;
      }

      cur++;
      this.header += c;
    }

    // if we get here, this means that we haven't reached the newline in the first chunk
    done();
  }

  _flush(done) {
    done();
  }
}

function escapeHeaders(headers) {
  const columns = headers.split(',');

  const escapedColumns = _.map(columns, column => {
    if (column.startsWith('"') && column.endsWith('"')) {
      // already escaped
      return column;
    }

    const segments = column.split('|');

    let name = unquote(unquote(segments[0]));
    let unit = unquote(unquote(segments[1]));

    if (unit) {
      return `${name} [${unit}]`;
    } else {
      return name;
    }
  });

  return Buffer.from(escapedColumns.join(','));
}
 
module.exports = () => new CleanHeaders()