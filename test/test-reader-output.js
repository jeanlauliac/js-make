'use strict';
module.exports = testReaderOutput

var forEachChar = require('../lib/for-each-char')

function testReaderOutput(t, reader, result) {
    var buffer = ''
    t.plan(3)
    reader.consume(function (err) {
        t.error(err)
        forEachChar(reader, function (ch, cb) {
            if (ch === null) return cb(null, true)
            buffer += ch
            return cb();
        }, function (err) {
            t.error(err)
            t.equal(buffer, result)
        })
    })
}
