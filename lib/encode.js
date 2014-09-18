var Transform = require('stream').Transform
var inherits = require('inherits')
var crc32 = require('buffer-crc32')

var PNGsignature = new Buffer([137, 80, 78, 71, 13, 10, 26, 10])

function Encoder(opts) {
  if(!(this instanceof Encoder)) return new Encoder(opts)
  this.signature = false
  Transform.call(this, {objectMode: true})
}
inherits(Encoder, Transform)

Encoder.prototype._transform = function _transform(chunk, enc, cb) {
  if(!this.signature) {
    this.push(PNGsignature)
    this.signature = true
  }
  
  var length = new Buffer(4)
  length.writeUInt32BE(chunk.length || chunk.data.length, 0)
  this.push(length)
  
  var type = new Buffer(chunk.type)
  this.push(type)
  
  this.push(chunk.data)
  this.push(chunk.crc || crc32(Buffer.concat([type, chunk.data])))
  
  cb()
}

Encoder.prototype._flush = function (cb) {
  cb()
}

module.exports = Encoder