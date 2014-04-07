'use strict';
var test = require('tape');
var read = require('../lib/read');
var util = require('util');
var Readable = require('stream').Readable;

var OPTS = {};

var MK_SIMPLE_DEPS =
    'foo: bar typ\n\n' +
    'bar ash: glo fiz\n';

var MK_COMMAND =
    'foo: bar typ\n' +
    '    cat bar typ > foo\n';

var MK_COMMENT =
    'foo: bar # the cake is a lie\n' +
    'col: bal';

testRead('simple deps', MK_SIMPLE_DEPS, function (t, file) {
    t.equal(file.rules[0].targets[0], 'foo');
    t.equal(file.rules[1].targets[0], 'bar');
    t.equal(file.rules[1].targets[1], 'ash');
    t.equal(file.rules[0].prerequisites[0], 'bar');
    t.equal(file.rules[0].prerequisites[1], 'typ');
    t.equal(file.rules[1].prerequisites[0], 'glo');
    t.equal(file.rules[1].prerequisites[1], 'fiz');
    t.end();
});

testRead('command', MK_COMMAND, function (t, file) {
    t.equal(file.rules[0].commands[0].sh, 'cat bar typ > foo');
    t.end();
});

testRead('comment', MK_COMMENT, function (t, file) {
    t.equal(file.rules[0].targets[0], 'foo');
    t.equal(file.rules[0].prerequisites[0], 'bar');
    t.equal(file.rules[1].targets[0], 'col');
    t.equal(file.rules[1].prerequisites[0], 'bal');
    t.end();
});

function testRead(desc, str, cb) {
    test('read() ' + desc, function (t) {
        read(new StringReadable(str), OPTS, function (err, file) {
            if (err) throw err;
            return cb(t, file);
        });
    });
}

util.inherits(StringReadable, Readable);
function StringReadable(str, opts) {
    if (!opts) opts = {};
    opts.encoding = 'utf8';
    Readable.call(this, opts);
    this._str = str;
}

StringReadable.prototype._read = function () {
    this.push(this._str);
    this.push(null);
};
