FISTBOOT_SERVICE := $(shell base64 -w0 < aux/custom-first-boot.service)

help:
	@cat Makefiles

.PHONY: prep
prep: src/constants.ts

.PHONY: install
install:
	npm install

.PHONY: start
start: prep
	npm start

