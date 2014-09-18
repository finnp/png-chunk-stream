var Transform = require('stream').Transform
var inherits = require('inherits')

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
  
  var buffer = new Buffer(8)
  buffer.writeUInt32BE(chunk.length, 0)
  buffer.write(chunk.type, 4)
  this.push(buffer)
  
  this.push(chunk.data)
  this.push(chunk.crc)
  
  cb()
}

Encoder.prototype._flush = function (cb) {
  cb()
}

module.exports = Encoder