'use strict';

module.exports = File;

function File() {
    Object.defineProperty(this, 'rules', {value: []});
    Object.defineProperty(this, 'env', {value: {}});
}

File.prototype.addRule = function (targets, prereqs, commands, infer) {
    this.rules.push({
        targets: targets,
        prereqs: prereqs,
        commands: commands,
        infer: infer
    });
};

File.prototype.getEnv = function (name) {
    if (this.env.hasOwnProperty(name)) return this.env[name];
    return '';
};

File.prototype.setEnv = function (name, value) {
    this.env[name] = value;
};
