'use strict';
var test = require('tape')
var testReaderOutput = require('./test-reader-output')
var CommentingCharReader = require('../lib/commenting-char-reader')
var StringCharReader = require('./string-char-reader')

test('makeCommentingReadChar() simple', function (t) {
    testWith(t, 'the cake #comment\nis a lie#ah?', 'the cake \nis a lie')
})

test('makeCommentingReadChar() escaping', function (t) {
    testWith(t, 'the \\cake \\# is a lie', 'the \\cake # is a lie')
})

function testWith(t, source, result) {
    var reader = new CommentingCharReader(new StringCharReader(source))
    testReaderOutput(t, reader, result)
}
