'use strict';
module.exports = ListBuffer;

function ListBuffer() {
    this._buffer = '';
    this._list = [];
}

ListBuffer.prototype.push = function (ch) {
    this._buffer += ch;
};

ListBuffer.prototype.flush = function () {
    var list = this._list;
    this._list = [];
    return list;
};

ListBuffer.prototype.next = function () {
    if (this.buffer.length === 0) return;
    this._list.push(this._buffer);
    this._buffer = '';
};

Object.defineProperty(ListBuffer.prototype, 'empty', {get: function () {
    return this._buffer === '' && this._list.length === 0;
}});

Object.defineProperty(ListBuffer.prototype, 'length', {get: function () {
    return this._list.length;
}});
