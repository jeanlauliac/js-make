'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var childProcess = require('child_process');
var makeError = require('./make-error')({
    NO_RULE: 'no rule to make target "%s"'
});

module.exports = Update;

util.inherits(Update, EventEmitter);

function Update(makefile, targets) {
    var self = this;
    EventEmitter.call(this);
    this._makefile = makefile;
    this._cache = {};
    this._abort = false;
    this._updateMany(targets, function () {
        self.emit('done');
    });
}

Update.prototype._updateMany = function (targets, cb) {
    var self = this;
    targets = targets.slice();
    var entries = [];
    (function next() {
        var target = targets.shift();
        self._update(target, function (err, entry) {
            entries.push(entry);
            if (err || self._abort) return cb(err, entries);
            if (targets.length === 0) return cb(null, entries);
            return next();
        });
    })();
};

Update.prototype._update = function (target, cb) {
    var self = this;
    this._cacheEntryFor(target, function (err, entry) {
        if (err) return cb(err);
        if (entry.gotUpdated) return cb(null, entry);
        return self._updateEntry(entry, function (err) {
            return cb(err, entry);
        });
    });
};

Update.prototype._updateEntry = function (entry, cb) {
    var self = this;
    var rule = this._makefile.findRule(entry.name);
    if (rule === null) return cb(makeError('NO_RULE', entry.name));
    this._updateMany(rule.prerequisites, function (err, entries) {
        if (err) return cb(err);
        if (!needUpdate(entries, entry)) return cb(null);
        self._buildEntry(rule, entry, cb);
    });
};

Update.prototype._buildEntry = function (rule, entry, cb) {
    var self = this;
    if (rule.commands.length === 0) {
        entry.gotUpdated = true;
        process.nextTick(cb.bind(null, null));
    }
    var commands = rule.commands.slice();
    (function next() {
        if (commands.length === 0) {
            entry.gotUpdated = true;
            return cb(null);
        }
        var command = commands.shift();
        self._runCommand(command, function (err) {
            if (err) return cb(err);
            if (commands.length === 0) return cb(null);
            return next();
        });
    })();
};

Update.prototype._runCommand = function (command, cb) {
    var opts = { stdio: 'inherit' };
    childProcess.exec(command, opts, function (err) {
        return cb(err);
    });
};

Update.prototype._cacheEntryFor = function (target, cb) {
    if (this._cache.hasOwnProperty(target)) {
        process.nextTick(cb.bind(null, null, this._cache[target]));
    }
    var entry = new TargetEntry(target, function (err) {
        if (err) return cb(err);
        this._cache[target] = entry;
        return cb(null, entry);
    });
};

Update.prototype.abort = function () {
    if (this._abort) return;
    this._abort = true;
    // kill the current commands
};

function TargetEntry(name, cb) {
    Object.defineProperty(this, 'name', {value: name});
    this.gotUpdated = false;
    fs.stat(name, function (err, stat) {
        if (err) return cb(err);
        this.stat = stat;
        return cb();
    });
}

function needUpdate(entries, entry) {
    for (var i = 0; i < entries.length; ++i) {
        if (entries[i].gotUpdated ||
            entries[i].stat.mtime > entry.stat.mtime) {
            return true;
        }
    }
    return false;
}
