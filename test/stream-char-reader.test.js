'use strict';
var StreamCharReader = require('../lib/stream-char-reader')
var Readable = require('stream').Readable
var test = require('tape')
var util = require('util')

var CHUNKS = ['foo', 'bar', 'fi', 'kikoo']

test('StreamCharReader.read()', function (t) {
    var stream = new TestStream()
    StreamCharReader.fromStream(stream, function (err, reader) {
        t.error(err)
        var buffer = ''
        ;(function next(err) {
            t.error(err)
            var ch = reader.peek()
            if (ch === null) {
                var result = CHUNKS.join('')
                t.equal(buffer, result)
                return t.end()
            }
            buffer += ch
            reader.consume(next)
        })()
    })
})

util.inherits(TestStream, Readable)
function TestStream(opts) {
    if (!opts) opts = {}
    opts.encoding = 'utf8'
    Readable.call(this, opts)
    this._chunks = CHUNKS.slice()
}

TestStream.prototype._read = function () {
    var self = this
    setTimeout(function () {
        if (self._chunks.length > 0) self.push(self._chunks.shift())
        else self.push(null)
    }, 0)
}
