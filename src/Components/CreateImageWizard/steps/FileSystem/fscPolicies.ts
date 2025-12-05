import { MountpointPoliciesType } from './fscTypes';

// Policies according to https://github.com/osbuild/images/blob/main/pkg/policies/policies.go
export const MountpointPolicies: MountpointPoliciesType = {
  '/': {},
  '/etc': { Deny: true },
  '/usr': { Exact: true },
  '/sys': { Deny: true },
  '/proc': { Deny: true },
  '/dev': { Deny: true },
  '/run': { Deny: true },
  '/bin': { Deny: true },
  '/sbin': { Deny: true },
  '/lib': { Deny: true },
  '/lib64': { Deny: true },
  '/lost+found': { Deny: true },
  '/sysroot': { Deny: true },
  '/var/run': { Deny: true },
  '/var/lock': { Deny: true },
};
