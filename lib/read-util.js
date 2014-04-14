'use strict';
module.exports = {
  , makeCommentingReadChar: makeCommentingReadChar
  , makeReadToken: makeReadToken
  , makeEnvReadChar: makeEnvReadChar
  , repeat: repeat
}

var SPECIAL_CHARS = {' ': true, ':': true, '=': true, '\n': true, '#': true}
var ESCAPE_CHAR = '\\'

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

function makeEnvReadChar(readChar, file) {
    var buffer = []
    function readEnvChar(ch, cb) {
        if (ch !== '$') return cb(null, ch)
        readChar(function (err, ch) {
            if (err) return cb(err)
            if (ch === '$') return cb(null, ch)
            if (ch === '(')
                return readEnvVarName(readChar, function () {

                })
            buffer.push()
        })
    }
    var readNext
    return function readCharInEnv(cb) {
        readChar(function (err, ch) {
            if (err) return cb(err)
            return readNext(ch, cb)
        })
    }
}
