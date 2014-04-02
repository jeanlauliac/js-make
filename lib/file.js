'use strict';

module.exports = File;

function File() {
    this._rules = [];
    this._rulesByTarget = {};
}

File.prototype.addRule = function (rule) {
    this._rules.push(rule);
    for (var i = 0; i < rule.targets.length; ++i)
        this._rulesByTarget[rule.targets[i]] = rule;
};

File.prototype.findRule = function (target) {
    if (!this._rulesByTarget.hasOwnProperty(target)) return null;
    return this._rulesByTarget[target];
};
