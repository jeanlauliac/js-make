'use strict';

var util = require('util');

module.exports = function (templates) {
    return makeError.bind(null, templates);
};

function makeError() {
    var args = Array.prototype.slice.call(arguments);
    var templates = args.shift();
    var code = args.shift();
    var template = templates[code];
    if (typeof template === 'undefined') template = 'unknown error';
    var err = new Error(util.format.apply(null, [template].concat(args)));
    err.code = code;
    return err;
}
