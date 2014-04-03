'use strict';

var makeError = require('./make-error')({
    DUP_TARGET: 'duplicate rule for target "%s"'
});

module.exports = File;

function File() {
    this.rules = [];
    this._rulesByTarget = {};
}

File.prototype.addRule = function (rule) {
    this.rules.push(rule);
    for (var i = 0; i < rule.targets.length; ++i) {
        if (this._rulesByTarget.hasOwnProperty(rule.targets[i]))
            throw makeError('DUP_TARGET', rule.targets[i]);
        this._rulesByTarget[rule.targets[i]] = rule;
    }
};

File.prototype.findRule = function (target) {
    if (!this._rulesByTarget.hasOwnProperty(target)) return null;
    return this._rulesByTarget[target];
};
