var decode = require('./').decode
var encode = require('./').encode
var fs = require('fs')
var crypto = require('crypto')
var concat = require('concat-stream')

fs.createReadStream('test.png')
  .pipe(decode())
  .pipe(encode())
  .pipe(decode())
  .pipe(encode())
  .pipe(crypto.createHash('sha1'))
  .pipe(concat(function (hash1) {
    fs.createReadStream('test.png')
      .pipe(crypto.createHash('sha1'))
      .pipe(concat(function (hash2) {
        if(hash1.toString() === hash2.toString()) 
          console.log('pass')
        else
          throw new Error('fail')
      })) 
  }))
