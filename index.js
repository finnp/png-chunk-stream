var Transform = require('stream').Transform
var inherits = require('inherits')
var equal = require('buffer-equal')

var PNGsignature = new Buffer([137, 80, 78, 71, 13, 10, 26, 10])

function PNG() {
  this.nread = 0
  this.signature = null
  this.buffer = new Buffer(0)
  Transform.apply(this)
}
inherits(PNG, Transform)

PNG.prototype._transform = function _transform(chunk, enc, cb) {   
  this.push(chunk) 
  this.buffer = Buffer.concat([this.buffer, chunk]) // performance?
  this.nread += chunk.length
  
  // parse signature
  if(!this.signature) {
    if(this.nread >= 8) {
      this.nread -= 8
      this.signature = this.buffer.slice(0, 8)
      if(equal(this.signature, PNGsignature)) {
        this.buffer = this.buffer.slice(8)
        // this.push({type: 'signature', {data: signature})
      } else {
        return cb(new Error('Not a PNG signature'))
      }
    } else {
      return cb()
    }
  } 
   
  while(this.nread > 0) {
    this.current = this.current || {}
    
    if(this.nread >= 4 && !('length' in this.current)) {
      this.current.length =  this.buffer.readInt32BE(0)
      this.buffer = this.buffer.slice(4)
    }
    if(this.nread >= 8 && !('type' in this.current)) {
      this.current.type = this.buffer.slice(0, 4).toString('ascii')
      this.buffer = this.buffer.slice(4)
    }
    if(this.nread >= 8 + this.current.length && !('data' in this.current)) {
      this.current.data = this.buffer.slice(0, this.current.length)
      this.buffer = this.buffer.slice(this.current.length)
    }

    if(this.nread >= 12 + this.current.length ) {
      this.current.crc = this.buffer.slice(0, 4)
      this.buffer = this.buffer.slice(4)
      this.nread = this.nread - 12 - this.current.length
      // this.push(this.current)
      this.emit('chunk', this.current)
      this.current = false
    } else {
      return cb()
    }
  }  

}

// PNG.prototype.readChunk = function () {
//   var chunk = {}
//   chunk.length = this.buf.readInt32BE(0)
//   this.buf = this.buf.slice(4)
//   chunk.type = this.buf.slice(0, 4).toString('ascii')
//   this.buf = this.buf.slice(4)
//   chunk.data = this.buf.slice(0, chunk.length)
//   this.buf = this.buf.slice(chunk.length)
//   chunk.crc = this.buf.slice(0, 4)
//   this.buf = this.buf.slice(4)
//   return chunk
// }  

module.exports = PNG