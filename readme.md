# png-chunk-stream
Windows | Mac/Linux
------- | ---------
[![Windows Build status](http://img.shields.io/appveyor/ci/finnp/png-chunk-stream.svg)](https://ci.appveyor.com/project/finnp/png-chunk-stream/branch/master) | [![Build Status](https://travis-ci.org/finnp/png-chunk-stream.svg?branch=master)](https://travis-ci.org/finnp/png-chunk-stream)

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

## CLI

You can also install the module globally with the `-g` flag. This will
add a `png-chunk` script with the commands `encode` and `decode`. The buffers
will be encoded as `base64`.

```
$ png-chunk decode < test.png | head -2
{"length":13,"type":"IHDR","data":"AAACAQAAAWgIBgAAAA==","crc":"zvUobg=="}
{"length":25,"type":"tEXt","data":"U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeQ==","crc":"ccllPA=="}
$ png-chunk decode < test.png | png-chunk encode > out.png
(this basically copes test.png to out.png)
```