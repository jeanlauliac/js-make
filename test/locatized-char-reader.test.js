'use strict';
var test = require('tape')
var forEachChar = require('../lib/for-each-char')
var FileLocation = require('../lib/file-location')
var LocalizedCharReader = require('../lib/localized-char-reader')
var StringCharReader = require('./string-char-reader')

test('makeLocalizingReadChar()', function (t) {
    t.plan(3)
    var reader = new StringCharReader('the cake\nis A lie')
    var location = new FileLocation()
    reader = new LocalizedCharReader(reader, location)
    forEachChar(reader, function (ch, cb) {
        if (ch === 'A') {
            t.equal(location.line, 2)
            t.equal(location.column, 4)
            return cb(null, true)
        }
        return cb()
    }, function (err) {
        t.error(err)
    })
})
