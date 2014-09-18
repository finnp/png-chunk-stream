# png-chunk-stream

```
npm install png-chunk-stream
```
Decode and Encode PNGs into objects of [chunks](http://www.w3.org/TR/PNG/#11Chunks) like this:
```
{ length: 13,
  type: 'IHDR',
  data: <Buffer 00 00 02 01 00 00 01 68 08 06 00 00 00>,
  crc: <Buffer ce f5 28 6e> }
```

## Example

Create some funky glitch art like this:

```
var fs = require('fs')
var decoder = require('./').decode()
var encoder = require('./').encode()
var through = require('through2')
var crc32 = require('buffer-crc32')

fs.createReadStream('test.png')
  .pipe(decoder)
  .pipe(through.obj(function (chunk, enc, cb) {
    if(chunk.type === 'IHDR') {
      console.log('height', chunk.data.readUInt32BE(0))
      chunk.data.writeUInt32BE(512, 0)
      chunk.crc = crc32(Buffer.concat([new Buffer(chunk.type), chunk.data]))
    }
    this.push(chunk)
    cb()
  }))
  .pipe(encoder)
  .pipe(fs.createWriteStream('out.png'))
```