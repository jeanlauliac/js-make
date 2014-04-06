'use strict';

module.exports = Node;

var fs = require('fs');

function Node(filePath) {
    Object.defineProperty(this, 'filePath', {value: filePath});
    this._mtime = null;
    this._phony = false;
    this.dirty = false;
    this.edgeIn = null;
    this.edgesOut = [];
}

Node.prototype.statusKnown = function () {
    return this._phony || (this._mtime !== null);
};

Node.prototype.markPhony = function () {
    this._phony = true;
};

Node.prototype.updateStatus = function (cb) {
    var self = this;
    fs.stat(this.filePath, function (err, stat) {
        if (err) return cb(err);
        self.mtime = stat.mtime;
        return cb();
    });
};

// Node.prototype.needUpdate = function (targets) {
//     for (var i = 0; i < targets.length; ++i) {
//         if (targets[i].gotUpdated) return true;
//         if (targets[i].stat.mtime > this.stat.mtime) return true;
//     }
//     return false;
// };

// Node.prototype.toString = function () {
//     var str = '[';
//     str += this.gotUpdated ? 'U' : '.';
//     str += this.stat ? 'S' : '.';
//     str += this.commands.length > 0 ? 'C' : '.';
//     str += '] ' + this.name + ': ' + this.prerequisites.join(' ');
//     return str;
// };
