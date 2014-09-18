var fs = require('fs')
var decoder = require('./').decode()
var encoder = require('./').encode()
var through = require('through2')

fs.createReadStream('test.png')
  .pipe(decoder)
  .pipe(through.obj(function (chunk, enc, cb) {
    if(chunk.type === 'IHDR') {
      console.log('height', chunk.data.readUInt32BE(0))
      chunk.data.writeUInt32BE(512, 0)
      chunk.crc = null // recalculate
    }
    this.push(chunk)
    cb()
  }))
  .pipe(encoder)
  .pipe(fs.createWriteStream('out.png'))