'use strict';
module.exports = StringCharReader

function StringCharReader(str) {
    this._i = 0
    this._str = str
}

StringCharReader.prototype.peek = function () {
    if (this._i >= this._str.length) return null
    return this._str[this._i]
}

StringCharReader.prototype.consume = function (cb) {
    ++this._i
    process.nextTick(cb.bind(null, null, this.peek()))
};
