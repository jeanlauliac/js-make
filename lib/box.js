'use strict';
module.exports = Box

function Box(value) {
    this._value = value
}

Box.prototype.set = function (value) {
    this._value = value
}

Box.prototype.get = function () {
    return this._value
}

Box.prototype.flush = function () {
    var value = this._value
    this._value = void 0
    return value
}

Object.setProperty(Box.prototype, 'filled', function () {
    return typeof this._value !== 'undefined'
})
