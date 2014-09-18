# png-chunk-stream

A small simple helper for working with PNG files, inspired by [chunky-stream](https://www.npmjs.org/package/chunky-rice). 
It is supposed to be lightweight and usable with browserify.
There is another more complete module called [streampng](https://www.npmjs.org/package/streampng).

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

For the `encode` function the `crc` and `length` attributes can be omitted and will be
calculated from the `data` attribute.


## Example

Create some funky glitch art like this:

```js
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
```