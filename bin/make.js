#!/usr/bin/env node
'use strict';

var make = require('..');
var nopt = require('nopt');
var path = require('path');
var fs = require('fs');

var KNOWN_OPTS = {
    'help': Boolean,
    'version': Boolean,
    'env': Boolean,
    'file': String,
    'ignore-errors': Boolean,
    'greedy': Boolean,
    'dry-run': Boolean,
    'print': Boolean,
    'query': Boolean,
    'raw': Boolean,
    'lazy': Boolean,
    'silent': Boolean,
    'touch': Boolean
};

var SHORTHANDS = {
    'v': '--version',
    'e': '--env',
    'f': '--file',
    'i': '--ignore-errors',
    'k': '--greedy',
    'n': '--dry-run',
    'p': '--print',
    'q': '--query',
    'r': '--raw',
    'S': '--lazy',
    's': '--silent',
    't': '--touch'
};

var DEFAULT_MAKEFILE_PATHS = ['Makefile', 'makefile'];

var makeError = make.makeError({
    NO_MAKEFILE: 'error: no makefile found'
});

main();

function main() {
    var opts = nopt(KNOWN_OPTS, SHORTHANDS);
    var targets = opts.argv.remain;
    if (opts.help) return help();
    if (opts.version) return version();
    openAndBuild(targets, opts, function (err) {
        if (err) error(err);
        process.exit(err ? 2 : 0);
    });
}

function help() {
    var opts = {encoding: 'utf8'};
    fs.readFile(path.join(__dirname, 'help'), opts, function (err, data) {
        if (err) throw err;
        process.stderr.write(data);
    });
}

function version() {
    var pack = require(path.join(__dirname, '../package.json'));
    console.log(pack.version);
}

function openAndBuild(targets, opts, cb) {
    openInputStream(opts.file, function (err, input) {
        if (err) return cb(err);
        var makefile = new make.File(input);
        makefile.build(targets, cb);
    });
}

function openInputStream(filePath, cb) {
    process.stdin.setEncoding('utf8');
    if (filePath === '-') return cb(null, process.stdin);
    if (filePath) return tryCreateReadStream(filePath, cb);
    var filePaths = DEFAULT_MAKEFILE_PATHS.slice();
    (function next() {
        if (filePaths.length === 0) return cb(makeError('NO_MAKEFILE'));
        tryCreateReadStream(filePaths.shift(), function (err, stream) {
            if (err) return next();
            return cb(null, stream);
        });
    })();
}

function tryCreateReadStream(filePath, cb) {
    var stream = fs.createReadStream(filePath, {encoding: 'utf8'});
    stream.on('open', function () { cb(null, stream); });
    stream.on('error', function (err) { cb(err); });
}

function error(err) {
    console.error('make: ' + err.message);
}
