'use strict';

var File = require('./file');
var Rule = require('./rule');
var makeError = require('./make-error')({
    MISSING_SEP: 'missing separator, expected `:\' or `=\'',
    MISSING_COLON: 'missing colon `:\'',
    UNEXP_COLON: 'unexpected colon `: \' in prerequisite list'
});

module.exports = read;

var SPECIAL_CHARS = [' ', ':', '=', '\n', '#'];
var ESCAPE_CHAR = '\\';

function read(stream, opts, cb) {
    var reader = new Reader(opts);
    reader.process(stream, function (err) {
        return cb(err, reader.file);
    });
}

function Reader(opts) {
    this.file = new File();
    this._opts = opts;
    this._readNext = this._readFile;
    this._buffer = '';
    this._listBuffer = [];
    this._pendingRule = null;
    this._escaping = false;
    this._location = {line: 1, column: 0};
    this._pendingReadNext = null;
    this._inCommand = false;
}

Reader.prototype.process = function (stream, cb) {
    var self = this;
    stream.on('readable', onReadable);
    stream.on('end', onEnd);
    stream.on('error', onError);
    function onReadable() {
        try {
            self._processChars(stream.read());
        } catch (err) {
            onError(err);
        }
    }
    function onEnd() {
        try {
            self._readNext(null);
        } catch (err) {
            onError(err);
        }
        return cb(null);
    }
    function onError(err) {
        stream.removeListener('readable', onReadable);
        stream.removeListener('end', onEnd);
        stream.removeListener('error', onError);
        err.location = self._location;
        err.message = err.location.line + ':' +
                      err.location.column + ': ' + err.message;
        return cb(err);
    }
};

Reader.prototype._processChars = function (characters) {
    for (var i = 0; i < characters.length; ++i) {
        var ch = characters[i];
        this._readNext(ch);
        if (ch === '\n') {
            this._location.column = 0;
            ++this._location.line;
        } else {
            ++this._location.column;
        }
    }
};

Reader.prototype._readFile = function (ch) {
    if (this._processEscape(ch)) return;
    if (this._startComment(ch)) return;
    if (ch === ' ') {
        return this._bufferElement();
    }
    if (ch === ':') {
        this._bufferElement();
        this._pendingRule = new Rule(this._listBuffer);
        this._listBuffer = [];
        this._readNext = this._readRulePre;
        return;
    }
    if (ch === '=') {
        this._bufferElement();
        this._readNext = this._readMacroValue;
        return;
    }
    if (ch === '\n' || ch === null) {
        if (this._buffer === '' && this._listBuffer.length === 0) return;
        if (this._listBuffer.length >= 2) throw makeError('MISSING_COLON');
        throw makeError('MISSING_SEP');
    }
    this._buffer += ch;
};

Reader.prototype._readRulePre = function (ch) {
    if (this._processEscape(ch)) return;
    if (this._startComment(ch)) return;
    if (ch === ':') throw makeError('UNEXP_COLON');
    if (ch === ' ') return this._bufferElement();
    if (ch === '\n' || ch === null) {
        this._bufferElement();
        for (var i = 0; i < this._listBuffer.length; ++i)
            this._pendingRule.addPrerequisite(this._listBuffer[i]);
        this._listBuffer = [];
        this.file.addRule(this._pendingRule);
        this._readNext = this._readCommands;
        return;
    }
    this._buffer += ch;
};

Reader.prototype._readCommands = function (ch) {
    if (!this._inCommand) {
        if (ch === ' ' || ch === '\t') {
            this._inCommand = true;
            return;
        }
        this._readNext = this._readFile;
        this._pendingRule = null;
        return this._readNext(ch);
    }
    if (ch === '\n') {
        this._pendingRule.addCommand(this._buffer);
        this._buffer = '';
        this._inCommand = false;
        return;
    }
    if (this._buffer.length === 0 && (ch === ' ' || ch === '\t')) return;
    this._buffer += ch;
};

Reader.prototype._readMacroValue = function (ch) {
    if (this._processEscape(ch)) return;
    if (this._startComment(ch)) return;
    if (ch === ' ') {
        return this._bufferElement();
    }
    if (ch === '\n') {

    }
};

Reader.prototype._readComment = function (ch) {
    if (this._processEscape(ch)) return;
    if (ch === '\n') {
        this._readNext = this._pendingReadNext;
        this._readNext('\n');
    }
};

Reader.prototype._bufferElement = function () {
    if (this._buffer.length > 0) {
        this._listBuffer.push(this._buffer);
        this._buffer = '';
    }
};

Reader.prototype._startComment = function (ch) {
    if (ch === '#') {
        this._pendingReadNext = this._readNext;
        this._readNext = this._readComment;
        return true;
    }
    return false;
};

Reader.prototype._processEscape = function (ch) {
    if (!this._escaping) {
        if (ch === ESCAPE_CHAR) {
            this._escaping = true;
            return true;
        }
        return false;
    }
    if (ch in SPECIAL_CHARS) {
        if (ch === '\n') {
            this._readNext(' ');
            return true;
        }
        this._buffer += ch;
    } else {
        this._buffer += ESCAPE_CHAR + ch;
    }
    return true;
};
