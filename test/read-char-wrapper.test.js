'use strict';
var ReadCharWrapper = require('../lib/read-char-wrapper');
var Readable = require('stream').Readable;
var test = require('tape');
var util = require('util');

var CHUNKS = ['foo', 'bar', 'fi', 'kikoo'];

test('ReadCharWrapper.read()', function (t) {
    t.plan(1);
    var stream = new TestStream();
    var input = new ReadCharWrapper(stream);
    var buffer = '';
    (function next() {
        input.read(function (err, ch) {
            if (err) t.error(err);
            if (ch === null) {
                var result = CHUNKS.join('');
                t.equal(buffer, result);
                return;
            }
            buffer += ch;
            return next();
        });
    })();
});

util.inherits(TestStream, Readable);
function TestStream(opts) {
    if (!opts) opts = {};
    opts.encoding = 'utf8';
    Readable.call(this, opts);
    this._chunks = CHUNKS.slice();
}

TestStream.prototype._read = function () {
    var self = this;
    setTimeout(function () {
        if (self._chunks.length > 0) self.push(self._chunks.shift());
        else self.push(null);
    }, 0);
};
