'use strict';

module.exports = Rule;

function Rule(targets) {
    Object.defineProperty(this, 'targets', {value: targets.slice(),
                                            enumerable: true});
    Object.defineProperty(this, 'prerequisites', {value: [], enumerable: true});
    Object.defineProperty(this, 'commands', {value: [], enumerable: true});
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
