var fs = require('fs')
var stream = require('./')

var trans = new stream()

trans.on('chunk', function (chunk) {
  console.log(chunk)
})

fs.createReadStream('test.png')
  .pipe(trans)
  .pipe(fs.createWriteStream('out.png'))
  // .on('chunk',function (chunk) {
  //   // console.log(chunk)
  // })
  // .pipe(process.stdout)