var Transform = require('stream').Transform
var inherits = require('inherits')
var equal = require('buffer-equal')

var PNGsignature = new Buffer([137, 80, 78, 71, 13, 10, 26, 10])

function PNG(opts) {
  if(!(this instanceof PNG)) return new PNG(opts)
  this.nread = 0
  this.signature = null
  this.buffer = new Buffer(0)
  this.injects = []
  Transform.apply(this, opts)
}
inherits(PNG, Transform)

PNG.prototype.inject = function inject(buffer) {
  this.injects.push(buffer)
}

PNG.prototype._transform = function _transform(chunk, enc, cb) {   
  this.buffer = Buffer.concat([this.buffer, chunk]) // performance?
  this.nread += chunk.length
  
  // parse signature
  if(!this.signature) {
    if(this.nread >= 8) {
      this.nread -= 8
      this.signature = this.buffer.slice(0, 8)
      if(equal(this.signature, PNGsignature)) {
        this.push(this.signature)
        this.buffer = this.buffer.slice(8)
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
      this.push(this.buffer.slice(0,4))
      this.buffer = this.buffer.slice(4)
    }
    if(this.nread >= 8 && !('type' in this.current)) {
      var type = this.buffer.slice(0, 4)
      this.current.type = type.toString('ascii')
      this.push(type)
      this.buffer = this.buffer.slice(4)
    }
    if(this.nread >= 8 + this.current.length && !('data' in this.current)) {
      this.current.data = this.buffer.slice(0, this.current.length)
      this.push(this.current.data)
      this.buffer = this.buffer.slice(this.current.length)
    }

    if(this.nread >= 12 + this.current.length ) {
      this.current.crc = this.buffer.slice(0, 4)
      this.push(this.current.crc)
      this.buffer = this.buffer.slice(4)
      this.nread = this.nread - 12 - this.current.length
      // this.push(this.current)
      this.emit(this.current.type, this.current)
      
      // inject
      if(this.current.type === 'IHDR') {
        this.injects.forEach(function (buffer) {
          this.push(buffer)
        }.bind(this))
      }
      
      this.current = false
    } else {
      return cb()
    }
  }
}

module.exports = PNG