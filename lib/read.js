'use strict';

module.exports = Read;

var File = require('./file');

var makeError = require('./make-error')({
    MISSING_SEP: 'missing separator, expected `:\' or `=\'',
    MISSING_COLON: 'missing colon `:\'',
    UNEXP_COLON: 'unexpected colon `: \' in prerequisite list'
});

var SPECIAL_CHARS = [' ', ':', '=', '\n', '#'];
var ESCAPE_CHAR = '\\';

function Read(opts) {
    Object.defineProperty(this, 'file', {value: new File()});
    Object.defineProperty(this, 'opts', {value: opts});
    this._readNext = this._readFile;
    this._buffer = '';
    this._listBuffer = [];
    this._ruleTargets = null;
    this._rulePrereq = null;
    this._ruleCommands = null;
    this._escaping = false;
    this._location = {line: 1, column: 0};
    this._pendingReadNext = null;
    this._inCommand = false;
}

Read.prototype.process = function (stream, cb) {
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

Read.prototype._processChars = function (characters) {
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

Read.prototype._readFile = function (ch) {
    if (this._processEscape(ch)) return;
    if (this._startComment(ch)) return;
    if (ch === ' ') {
        return this._bufferElement();
    }
    if (ch === ':') {
        this._bufferElement();
        this._ruleTargets = this._listBuffer;
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

Read.prototype._readRulePre = function (ch) {
    if (this._processEscape(ch)) return;
    if (this._startComment(ch)) return;
    if (ch === ':') throw makeError('UNEXP_COLON');
    if (ch === ' ') return this._bufferElement();
    if (ch === '\n' || ch === null) {
        this._bufferElement();
        this._rulePrereq = this._listBuffer;
        this._listBuffer = [];
        this.file.addRule(this._pendingRule);
        this._readNext = this._readCommands;
        this._ruleCommands = [];
        return;
    }
    this._buffer += ch;
};

Read.prototype._readNextCommand = function (ch) {
    if (this._startComment(ch)) return;
    if (ch === ' ' || ch === '\t') {
        this._readNext = this._readCommand;
        return;
    }
    if (ch === '\n') return;
    this._flushRule();
    this._readNext = this._readFile;
    return this._readNext(ch);
};

Read.prototype._readCommand = function (ch) {
    if (this._processEscape(ch, true)) return;
    if (this._startComment(ch)) return;
    if (ch === '\n') {
        if (this._buffer !== '')
            this._ruleCommands.push(this._flushBuffer());
        this._readNext = this._readNextCommand;
        return;
    }
    if (this._buffer.length === 0 && (ch === ' ' || ch === '\t')) return;
    this._buffer += ch;
};

Read.prototype._readMacroValue = function (ch) {
    if (this._processEscape(ch)) return;
    if (this._startComment(ch)) return;
    if (ch === ' ') {
        return this._bufferElement();
    }
    if (ch === '\n') {

    }
};

Read.prototype._readComment = function (ch) {
    if (this._processEscape(ch)) return;
    if (ch === '\n') {
        this._readNext = this._pendingReadNext;
        this._readNext('\n');
    }
};

Read.prototype._flushRule = function () {
    this.file.addRule(this._ruleTargets, this._rulePrereq, this._ruleCommands);
};

Read.prototype._flushBuffer = function () {
    var buf = this._buffer;
    this._buffer = '';
    return buf;
};

Read.prototype._bufferElement = function () {
    if (this._buffer.length > 0) this._listBuffer.push(this._flushBuffer());
};

Read.prototype._startComment = function (ch) {
    if (ch !== '#') return false;
    this._pendingReadNext = this._readNext;
    this._readNext = this._readComment;
    return true;
};

Read.prototype._processEscape = function (ch, inCommand) {
    if (!this._escaping) {
        if (ch !== ESCAPE_CHAR) return false;
        this._escaping = true;
        return true;
    }
    if (ch === '\n' && inCommand) this._buffer += '\\\n';
    else if (!(ch in SPECIAL_CHARS)) this._buffer += ESCAPE_CHAR + ch;
    else if (ch === '\n') this._readNext(' ');
    else this._buffer += ch;
    return true;
};
