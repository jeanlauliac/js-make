'use strict';
module.exports = read;

var File = require('./file');
var ReadCharWrapper = require('./read-char-wrapper');
var FileLocation = require('./file-location');
var ListBuffer = require('./list-buffer');
var util = require('util');
var makeError = require('./make-error')({
    MISSING_SEP: 'missing separator, expected `:\' or `=\'',
    MISSING_COLON: 'missing colon `:\'',
    UNEXP_PREREQ_COLON: 'unexpected colon `: \' in prerequisite list'
});

var SPECIAL_CHARS = [' ', ':', '=', '\n', '#'];
var ESCAPE_CHAR = '\\';

var BUFFER_ABORT = 'aborting readChars in a buffer';

function read(stream, opts, cb) {
    var input = new ReadCharWrapper(stream);
    var location = new FileLocation();
    readFile(function readLocalizedChar(cb) {
        input.read(function (err, ch) {
            if (err) return cb(err);
            location.forward(ch);
            return cb(err, ch);
        });
    }, function finishRead(err, file) {
        if (!err) return cb(null, file);
        err.location = input.location;
        err.message = util.format('%s: %s', err.location + ': ' + err.message);
        return cb(err, file);
    });
}

function readFile(readChar, cb) {
    var file = new File();
    var buffer = new ListBuffer();
    readCommChars(readChar, function readFileChar(ch, cb) {
        if (ch === ' ') {
            buffer.next();
            return cb();
        } else if (ch === ':') {
            buffer.next();
            var fn = function finishRule(err, prereqs, commands, leftover) {
                if (err) return cb(err);
                file.pushRule(buffer.flush(), prereqs, commands);
                return readFileChar(leftover, cb);
            };
            readRuleBody(readChar, fn);
        } else if (ch === '=') {
            buffer.next();
            throw new Error('TODO');
        } else if (ch === '\n' || ch === null) {
            buffer.next();
            if (buffer.empty) return cb(ch === null ? false : null);
            if (buffer.length >= 2) return cb(makeError('MISSING_COLON'));
            return cb(makeError('MISSING_SEP'));
        } else {
            buffer.push(ch);
            return cb();
        }
    }, function finishFile(err) {
        return cb(err, file);
    });
}

function readRuleBody(readChar, cb) {
    var buffer = new ListBuffer();
    readCommChars(readChar, function readBodyChar(ch, cb) {
        if (ch === ':') return cb(makeError('UNEXP_PREREQ_COLON'));
        else if (ch === ' ') {
            buffer.next();
            return cb();
        } else if (ch === '\n' || ch === null) {
            buffer.next();
            return cb(false);
        } else {
            buffer.push(ch);
            return cb();
        }
    }, function finishBody(err) {
        if (err) return cb(err);
        readRuleCommands(readChar, function (err, commands, leftover) {
            return cb(err, buffer.flush(), commands, leftover);
        });
    });
}

function readRuleCommands(readChar, cb) {
    var commands = [];
    var leftover = null;
    readCommChars(readChar, function readCommandsChar(ch, cb) {
        if (ch === ' ' || ch === '\t') {
            return readRuleCommand(readChar, function (err, command) {
                if (err) return cb(err);
                if (command != null) commands.push(command);
                return cb();
            });
        } else {
            leftover = ch;
            return cb(false);
        }
    }, function finishCommands(err) {
        return cb(err, commands, leftover);
    });
}

function readRuleCommand(readChar, cb) {
    var command = '';
    readEscChars(readChar, true, function readCommandChar(ch, cb) {
        if (ch === '\n' || ch === null) return cb(false);
        if (command.length === 0 && (ch === ' ' || ch === '\t')) return cb();
        command += ch;
        return cb();
    }, function finishCommand(err) {
        if (command.length === 0) return cb(err, null);
        return cb(err, {sh: command});
    });
}

function readCommChars(readChar, iter, cb) {
    var commented = false;
    readEscChars(readChar, false, function (ch, cb) {
        if (commented) {
            if (ch === '\n' || ch === null) {
                commented = false;
                return iter(ch, cb);
            }
            return cb();
        }
        if (ch === '#') {
            commented = true;
            return cb();
        }
        return iter(ch, cb);
    }, cb);
}

function readEscChars(readChar, inCommand, iter, cb) {
    var escaping = false;
    readChars(readChar, function (ch, cb) {
        if (!escaping) {
            if (ch !== ESCAPE_CHAR) return iter(ch, cb);
            escaping = true;
            return cb();
        }
        var buffer = '';
        if (ch === '\n' && inCommand) buffer = '\\\n';
        else if (!(ch in SPECIAL_CHARS)) buffer = ESCAPE_CHAR + ch;
        else if (ch === '\n') buffer = ' ';
        else buffer = ch;
        escaping = false;
        readBufferChars(buffer, iter, cb);
    }, cb);
}

function readBufferChars(buffer, iter, cb) {
    (function next(i) {
        if (i === buffer.length) return cb();
        return iter(buffer[i], function (err) {
            if (err === false) return cb(new Error(BUFFER_ABORT));
            if (err) return cb(err);
            return next(i + 1);
        });
    })(0);
}

function readChars(readChar, iter, cb) {
    (function next() {
        readChar(function (err, ch) {
            if (err) return cb(err);
            iter(ch, function (err) {
                if (err === false) return cb();
                if (err) return cb(err);
                return next();
            });
        });
    })();
}
