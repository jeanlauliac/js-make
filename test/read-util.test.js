'use strict';
var test = require('tape')
var readUtil = require('../lib/read-util')
var FileLocation = require('../lib/file-location')

test('repeat()', function (t) {
    t.plan(3)
    var readChar = makeStringReadChar('foobar')
    var buffer = ''
    readUtil.repeat(readChar, function (ch, cb) {
        if (ch === null) return cb(null, 'finished')
        buffer += ch
        return cb()
    }, function (err, datum) {
        t.equal(datum, 'finished')
        t.equal(buffer, 'foobar')
        t.error(err)
    })
})

test('makeLocalizingReadChar()', function (t) {
    t.plan(3)
    var readChar = makeStringReadChar('the cake\nis A lie')
    var location = new FileLocation()
    readChar = readUtil.makeLocalizingReadChar(readChar, location)
    readUtil.repeat(readChar, function (ch, cb) {
        if (ch === 'A') {
            t.equal(location.line, 2)
            t.equal(location.column, 4)
            return cb(null, true)
        }
        return cb();
    }, function (err) {
        t.error(err)
    })
})

test('makeCommentingReadChar() simple', function (t) {
    t.plan(2)
    var readChar = makeStringReadChar('the cake #comment\nis a lie#ah?')
    var buffer = ''
    readChar = readUtil.makeCommentingReadChar(readChar)
    readUtil.repeat(readChar, function (ch, cb) {
        if (ch === null) return cb(null, true)
        buffer += ch
        return cb();
    }, function (err) {
        t.error(err)
        t.equal(buffer, 'the cake \nis a lie')
    })
})

test('makeCommentingReadChar() escaping', function (t) {
    t.plan(2)
    var readChar = makeStringReadChar('the \\cake \\# is a lie')
    var buffer = ''
    readChar = readUtil.makeCommentingReadChar(readChar)
    readUtil.repeat(readChar, function (ch, cb) {
        if (ch === null) return cb(null, true)
        buffer += ch
        return cb();
    }, function (err) {
        t.error(err)
        t.equal(buffer, 'the \\cake # is a lie')
    })
})

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

function makeStringReadChar(str) {
    var i = 0
    return function readStringChar(cb) {
        if (i >= str.length) return process.nextTick(cb.bind(null, null, null))
        process.nextTick(cb.bind(null, null, str[i]))
        i++
    }
}
