import type { Bootc } from '@/store/api/backend/onprem';

// Image mode: the bootc container provides the OS content. The
// CLI resolves the reference from root's local container storage,
// where the wizard has already pulled it.
export const getBootcArgs = (bootc: Bootc | undefined): string[] => {
  if (!bootc) {
    return [];
  }
  const args = ['--bootc-ref', bootc.reference];
  if (bootc.build_reference) {
    args.push('--bootc-build-ref', bootc.build_reference);
  }
  if (bootc.iso_payload_reference) {
    args.push('--bootc-installer-payload-ref', bootc.iso_payload_reference);
  }
  return args;
};
