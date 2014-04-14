'use strict';
var test = require('tape')
var readUtil = require('../lib/read-util')
var FileLocation = require('../lib/file-location')

test('makeReadToken() simple', function (t) {
    t.plan(2)
    var readChar = makeStringReadChar('the cake: is a lie')
    var buffer = []
    var readToken = readUtil.makeReadToken(readChar)
    readUtil.repeat(readToken, function (token, cb) {
        if (token === null) return cb(null, true)
        buffer.push(token)
        return cb();
    }, function (err) {
        t.error(err)
        t.same(buffer, ['the', 'cake', ':', 'is', 'a', 'lie'])
    })
})

test('makeReadToken() escaping', function (t) {
    t.plan(2)
    var readChar = makeStringReadChar('the  \ncake\\: i\\s a lie')
    var buffer = []
    var readToken = readUtil.makeReadToken(readChar)
    readUtil.repeat(readToken, function (token, cb) {
        if (token === null) return cb(null, true)
        buffer.push(token)
        return cb();
    }, function (err) {
        t.error(err)
        t.same(buffer, ['the', '\n', 'cake:', 'i\\s', 'a', 'lie'])
    })
})
