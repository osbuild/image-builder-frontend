FISTBOOT_SERVICE := $(shell base64 -w0 < aux/custom-first-boot.service)

src/constants.ts: aux/custom-first-boot.service
	sed -i "s/.*FIRST_BOOT_SERVICE_DATA.*/export const FIRST_BOOT_SERVICE_DATA = '$(FISTBOOT_SERVICE)';/" $@
