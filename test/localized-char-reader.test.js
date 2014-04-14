'use strict';
var test = require('tape')
var forEachChar = require('../lib/for-each-char')
var FileLocation = require('../lib/file-location')
var LocalizedCharReader = require('../lib/localized-char-reader')
var StringCharReader = require('./string-char-reader')

test('makeLocalizingReadChar()', function (t) {
    t.plan(4)
    var reader = new StringCharReader('the cake\nis A lie')
    var location = new FileLocation()
    reader = new LocalizedCharReader(reader, location)
    reader.consume(function (err) {
        t.error(err)
        forEachChar(reader, function (ch, cb) {
            if (ch === 'A') return cb(null, true)
            return cb()
        }, function (err) {
            t.error(err)
            t.equal(location.line, 2)
            t.equal(location.column, 4)
        })
    })
})
