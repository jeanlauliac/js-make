'use strict';
module.exports = forEachChar

function forEachChar(reader, iter, cb) {
    function next() {
        iter(reader.peek(), function (err, datum) {
            if (err || typeof datum !== 'undefined')
                return cb(err, datum);
            reader.consume(function (err) {
                if (err) return cb(err);
                return next();
            })
        })
    }
    process.nextTick(next)
}
