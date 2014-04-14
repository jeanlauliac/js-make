'use strict';
module.exports = FileLocation

var util = require('util')

function FileLocation() {
    this.line = 1
    this.column = 1
}

FileLocation.prototype.forward = function (ch) {
    if (ch === null) return
    if (ch === '\n') {
        this.column = 1
        ;++this.line
    } else {
        ++this.column
    }
}

FileLocation.prototype.toString = function () {
    return util.format('%d:%d', this.line, this.column)
}
