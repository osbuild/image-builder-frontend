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

// Policies according to https://github.com/osbuild/images/blob/main/pkg/distro/bootc/partition.go
export const ImageModeMountpointPolicies: MountpointPoliciesType = {
  '/': {},
  '/boot': { Deny: false, Exact: true },
  '/var': { Deny: false },
  '/var/home': { Deny: true },
  '/var/lock': { Deny: true },
  '/var/mail': { Deny: true },
  '/var/mnt': { Deny: true },
  '/var/roothome': { Deny: true },
  '/var/run': { Deny: true },
  '/var/srv': { Deny: true },
  '/var/usrlocal': { Deny: true },
};
