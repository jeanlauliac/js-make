'use strict';
module.exports = FileLocation;

function FileLocation() {
    this.line = 1;
    this.column = 0;
}

FileLocation.prototype.forward = function (ch) {
    if (ch === '\n') {
        this.column = 0;
        ++this.line;
    } else {
        ++this.column;
    }
};

FileLocation.prototype.toString = function () {
    return util.format('%d:%d', this.line, this.column);
};

var util = require('util');