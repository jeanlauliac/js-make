'use strict';
module.exports = ReadCharWrapper;

function ReadCharWrapper(stream) {
    this.stream = stream;
    this._error = null;
    this._done = false;
    this._onEvent = null;
    this._handlers = {
        readable: this._onStreamReadable.bind(this),
        error: this._onStreamError.bind(this),
        end: this._onStreamEnd.bind(this),
    };
    stream.on('readable', this._handlers.readable);
    stream.on('error', this._handlers.error);
    stream.on('end', this._handlers.end);
}

ReadCharWrapper.prototype._onStreamReadable = function () {
    if (this._onEvent) this._onEvent();
};

ReadCharWrapper.prototype._onStreamEnd = function () {
    this._done = true;
    if (this._onEvent) this._onEvent();
    this._finish();
};

ReadCharWrapper.prototype._onStreamError = function (err) {
    this._error = err;
    if (this._onEvent) this._onEvent();
    this._finish();
};

ReadCharWrapper.prototype._finish = function () {
    this.stream.removeListener('readable', this._handlers.readable);
    this.stream.removeListener('error', this._handlers.error);
    this.stream.removeListener('end', this._handlers.end);
};

ReadCharWrapper.prototype.read = function (cb) {
    if (this._error)
        return process.nextTick(cb.bind(null, this._error));
    var ch = this.stream.read(1);
    if (ch !== null)
        return process.nextTick(cb.bind(null, null, ch));
    if (this._done)
        return process.nextTick(cb.bind(null, null, null));
    var self = this;
    this._onEvent = function () {
        self._onEvent = null;
        if (self._error) return cb(self._error, null);
        if (self._done) return cb(null, null);
        return cb(null, self.stream.read(1));
    };
};
