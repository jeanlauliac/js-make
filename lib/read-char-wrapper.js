'use strict';
module.exports = ReadCharWrapper;

function ReadCharWrapper(stream) {
    this.stream = stream;
    this._char = null;
    this._error = null;
    this._done = false;
    this._onChar = this._memoize.bind(this);
    this._handlers = {
        readable: this._onStreamReadable.bind(this),
        error: this._onStreamError.bind(this),
        end: this._onStreamEnd.bind(this),
    };
    stream.on('readable', this._handlers.readable);
    stream.on('error', this._handlers.error);
    stream.on('end', this._handlers.end);
}

ReadCharWrapper.prototype._memoize = function (err, ch) {
    if (err) this._error = err;
    else if (ch) this._char = ch;
    else this._done = true;
};

ReadCharWrapper.prototype._onStreamReadable = function () {
    if (this._char === null)
        this._onChar(this.stream.read(1));
};

ReadCharWrapper.prototype._onStreamEnd = function () {
    this._onChar(null, null);
    this._finish();
};

ReadCharWrapper.prototype._onStreamError = function (err) {
    this._onChar(err);
    this._finish();
};

ReadCharWrapper.prototype._finish = function () {
    this.stream.removeListener('readable', this._handlers.readable);
    this.stream.removeListener('error', this._handlers.error);
    this.stream.removeListener('end', this._handlers.end);
};

ReadCharWrapper.prototype.readChar = function (cb) {
    if (this._error)
        return cb(this._error);
    if (this._char === null)
        this._char = this.stream.read(1);
    if (this._char !== null) {
        process.nextTick(cb.bind(null, this._char));
        this._char = null;
        return;
    }
    if (this._done) {
        return process.nextTick(cb.bind(null, null));
    }
    var self = this;
    this._onChar = function (err, ch) {
        self._onChar = self._memoize.bind(self);
        cb(err, ch);
    };
};
