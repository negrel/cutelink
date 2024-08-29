.PHONY:
start: utils/random_sequences.json
	deno task start |& bunyan

.PHONY: lint
lint:
	deno task lint

.PHONY: lint/fix
lint/fix:
	deno task lint:fix

utils/random_sequences.json:
	deno run ./scripts/gen_random_sequences.ts > $@

.PHONY: test
test: lint
	deno test

.PHONY: build
build: utils/random_sequences.json
	deno task build
