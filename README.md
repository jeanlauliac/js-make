# make

*Work in progress!*

**make** is a pure Javascript implementation of the
[make](http://pubs.opengroup.org/onlinepubs/009695399/utilities/make.html) build
utility specification. You can use it directly as a Node.js module, but you will
likely use the command-line version. It is usable as a drop-in replacement of a
native version (such as [GNU Make](https://www.gnu.org/software/make/)).

This build utility updates files based on other files. For example, making a
JavaScript file from a [CoffeeScript](http://coffeescript.org/) file; or making
a CSS file from a [SASS](http://sass-lang.com/) file. The utility examines time
relationships and shall update those derived files (called targets) that have
modified times earlier than the modified times of the files (called
prerequisites) from which they are derived.

## Installation

    npm install make

If installed locally, the binary is available as `node_module/.bin/make`.
However, you can directly refer to `make` in
[npm-scripts](https://www.npmjs.org/doc/misc/npm-scripts.html#path).

## Example usage

Assuming `foo.mk`:

```make
.PHONY: all
all: beep.js

beep.js:
    echo 'console.log("boop");' > $@
```

### From a shell

```bash
make all -f foo.mk
#=> echo 'console.log("boop");' > beep.js
```

### From JavaScript

```js
// example.js
'use strict';

var make = require('make');
var fs = require('fs');

var context = new make.File(fs.createFileStream('./foo.mk'));

var target = context.build('all');
target.on('built', function () {
    console.log('done building 'all'!');
});
```

Then, in a shell:

```bash
node example.js
#=> done building 'all'!
```

## API

### Class: make.File

Load and track state of a Makefile during a build session.

#### new File({stream | path}, opts)

  * `stream` *Stream* Input to read the Makefile from.
  * `path` *String* Input file path to read the Makefile from.
  * `opts` *Object* Options.

#### file.build({ path | paths }, cb)

  * `path` *String* Path of the single target to build.
  * `paths` *Array* Multiple target paths.
  * `cb(err)` *Function* Called with the last error.

#### Event: 'error'

An error occured while processing the target.
