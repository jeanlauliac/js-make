'use strict';

module.exports = Rule;

function Rule() {
    Object.defineProperty(this, 'targets', {value: []});
    Object.defineProperty(this, 'prerequisites', {value: []});
    Object.defineProperty(this, 'commands', {value: []});
}

Rule.prototype.addTarget = function (name) {
    this.targets.push(name);
};

Rule.prototype.addPrerequisite = function (name) {
    this.prerequisites.push(name);
};

Rule.prototype.addCommand = function (sh, opts) {
    this.commands.push({sh: sh, opts: opts});
};
