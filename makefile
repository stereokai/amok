test: test-lib test-bin

test-bin:
	git reset HEAD -- test/fixture
	tape test/bin_*.js

test-lib:
	git reset HEAD -- test/fixture
	tape test/lib_*.js

.PHONY: test test-bin test-lib
