'use strict';
module.exports = {
    makeLocalizingReadChar: makeLocalizingReadChar
  , makeCommentingReadChar: makeCommentingReadChar
  , makeReadToken: makeReadToken
  , repeat: repeat
}

var SPECIAL_CHARS = {' ': true, ':': true, '=': true, '\n': true, '#': true}
var ESCAPE_CHAR = '\\'

function makeLocalizingReadChar(readChar, location) {
    return function readLocalizedChar(cb) {
        readChar(function (err, ch) {
            if (err) return cb(err)
            location.forward(ch)
            return cb(err, ch)
        })
    }
}

function makeCommentingReadChar(readChar) {
    var escapeBuffer = []
    return function readCharCommented(cb) {
        if (escapeBuffer.length > 0)
            return process.nextTick(cb.bind(null, null, escapeBuffer.pop()))
        readChar(function (err, ch) {
            if (err) return cb(err)
            if (ch === '#') return readCommentBody(readChar, cb)
            if (ch === '\\') {
                return readChar(function (err, ch) {
                    if (err) return cb(err)
                    if (ch === '#') return cb(null, ch)
                    escapeBuffer.push(ch)
                    return cb(null, '\\')
                })
            }
            return cb(null, ch)
        })
    }
}

function readCommentBody(readChar, cb) {
    repeat(readChar, function (ch, cb) {
        if (ch === '\n' || ch === null) return cb(null, ch)
        return cb()
    }, cb)
}

function makeReadToken(readChar) {
    var token = ''
    var buffer = []
    function readTokenChar(ch, cb) {
        if (ch === ESCAPE_CHAR) {
            return readChar(function readEscapeChar(err, ch) {
                if (err) return cb(err)
                if (ch === '\n') token += ' '
                if (SPECIAL_CHARS.hasOwnProperty(ch)) token += ch
                else token += ESCAPE_CHAR + ch
                return cb()
            })
        }
        if ((SPECIAL_CHARS.hasOwnProperty(ch) || ch === null) &&
            token.length > 0) {
            buffer.push(ch)
            cb(null, token)
            token = ''
            return
        }
        if (ch === ' ') return cb()
        if (SPECIAL_CHARS.hasOwnProperty(ch)) return cb(null, ch)
        if (ch === null) return cb(null, null)
        token += ch
        return cb()
    }
    return function readToken(cb) {
        if (buffer.length === 0) return repeat(readChar, readTokenChar, cb)
        return process.nextTick(function () {
            readTokenChar(buffer.pop(), function (err, token) {
                if (err || typeof token !== 'undefined')
                    return cb(err, token)
                return repeat(readChar, readTokenChar, cb)
            })
        })
    }
}

function repeat(something, iter, cb) {
    (function next() {
        something(function (err, ch) {
            if (err) return cb(err);
            iter(ch, function (err, datum) {
                if (err || typeof datum !== 'undefined')
                    return cb(err, datum);
                return next();
            });
        });
    })();
}