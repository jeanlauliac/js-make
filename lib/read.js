'use strict';

var File = require('file');
var byline = require('byline');

module.exports = read;

function read(stream, opts, cb) {
    var makefile = new File();
    stream = byline(stream);
    stream.on('readable', function () {
        stream.read();
    });
    stream.on('end', function () {
        return cb(null, makefile);
    });
    stream.on('error', function (err) {
        return cb(err);
    });
}
