'use strict';
module.exports = ReadCharWrapper

function ReadCharWrapper(stream) {
    this.stream = stream
    this._error = null
    this._done = false
    this._onEvent = null
    this._current = null
    this._handlers = {
        readable: this._onStreamReadable.bind(this)
      , error: this._onStreamError.bind(this)
      , end: this._onStreamEnd.bind(this)
    };
    stream.on('readable', this._handlers.readable)
    stream.on('error', this._handlers.error)
    stream.on('end', this._handlers.end)
}

ReadCharWrapper.prototype._onStreamReadable = function () {
    this._current = this.stream.read(1)
    if (this._onEvent) this._onEvent()
}

ReadCharWrapper.prototype._onStreamEnd = function () {
    this._current = null
    this._done = true
    if (this._onEvent) this._onEvent()
    this._finish()
}

ReadCharWrapper.prototype._onStreamError = function (err) {
    this._error = err
    if (this._onEvent) this._onEvent()
    this._finish()
}

ReadCharWrapper.prototype._finish = function () {
    this.stream.removeListener('readable', this._handlers.readable)
    this.stream.removeListener('error', this._handlers.error)
    this.stream.removeListener('end', this._handlers.end)
}

ReadCharWrapper.prototype.peek = function () {
    return this._current;
}

ReadCharWrapper.prototype.consume = function (cb) {
    if (this._error || this._done)
        return process.nextTick(cb.bind(null, this._error, null))
    this._current = this.stream.read(1)
    if (this._current !== null)
        return process.nextTick(cb.bind(null, null, this._current))
    this._onEvent = (function () {
        this._onEvent = null
        if (this._error) return cb(this._error, null)
        return cb(null, this._current)
    }).bind(this)
}
