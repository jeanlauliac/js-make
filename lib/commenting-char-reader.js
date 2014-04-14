'use strict';
module.exports = CommentingCharReader

var forEachChar = require('./for-each-char')

function CommentingCharReader(reader) {
    this._reader = reader
    this._escapeBuffer = []
}

CommentingCharReader.prototype.peek = function () {
    if (this._escapeBuffer.length > 0) return this._escapeBuffer[0]
    return this._reader.peek()
}

CommentingCharReader.prototype.consume = function (cb) {
    if (this._escapeBuffer.length > 0) {
        this._escapeBuffer.pop()
        return process.nextTick(cb.bind(null, null, this.peek()))
    }
    var self = this
    this._reader.consume(function (err, ch) {
        if (err) return cb(err)
        if (ch === '#') return self._readCommentBody(cb)
        if (ch === '\\') {
            return self._reader.consume(function (err, ch) {
                if (err) return cb(err)
                if (ch === '#') return cb(null, ch)
                self._escapeBuffer.push('\\')
                return cb(null, '\\')
            })
        }
        return cb(null, ch)
    })
}

CommentingCharReader.prototype._readCommentBody = function (cb) {
    var self = this
    this._reader.consume(function (err) {
        if (err) return cb(err)
        forEachChar(self._reader, function (ch, cb) {
            if (ch === '\n' || ch === null) return cb(null, ch)
            return cb()
        }, cb)
    })
}
