'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = Update;

util.inherits(Update, EventEmitter);

function Update(makefile, targets) {
    var self = this;
    EventEmitter.call(this);
    this._makefile = makefile;
    this._targets = {};
    this._abort = false;
    this._proceedMany(targets, function () {
        self.emit('done');
    });
}

Update.prototype._proceedMany = function (targets, cb) {
    var self = this;
    targets = targets.slice();
    (function next() {
        var target = targets.shift();
        self._proceed(target, function (err) {
            if (err || self._abort) return cb(err);
            if (targets.length === 0) return cb(null);
            return next();
        });
    })();
};

Update.prototype._proceed = function (target, cb) {
    var rule = this._makefile.findRule(target);

};

Update.prototype.abort = function () {
    if (this._abort) return;
    this._abort = true;
    // kill the current commands
};
