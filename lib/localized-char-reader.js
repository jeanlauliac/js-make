'use strict';
module.exports = LocalizedCharReader

function LocalizedCharReader(reader, location) {
    this._reader = reader
    this._location = location
    this.peek = reader.peek.bind(reader)
}

LocalizedCharReader.prototype.consume = function (cb) {
    this._location.forward(this._reader.peek())
    this._reader.consume(cb)
}
