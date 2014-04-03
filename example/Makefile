.PHONY: all
all: output/cake.js

output/%.js: %.txt
	[ -d output ] || mkdir output
	echo "console.log('"$$(cat $<)"')" > $@
