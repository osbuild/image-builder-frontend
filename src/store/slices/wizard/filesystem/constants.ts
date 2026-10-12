import { FilesystemType } from './types';

export const FILESYSTEM_TYPES: FilesystemType[] = [
  'ext4',
  'xfs',
  'vfat',
  'swap',
];

export const RESERVED_MOUNTPOINTS = {
  // Policies according to https://github.com/osbuild/images/blob/main/pkg/policies/policies.go
  packageMode: [
    '/etc',
    '/sys',
    '/proc',
    '/dev',
    '/run',
    '/bin',
    '/sbin',
    '/lib',
    '/lib64',
    '/lost+found',
    '/sysroot',
    '/var/run',
    '/var/lock',
  ] as const,
  // Policies according to https://github.com/osbuild/images/blob/main/pkg/distro/bootc/partition.go
  imageMode: [
    '/var/home',
    '/var/lock',
    '/var/mail',
    '/var/mnt',
    '/var/roothome',
    '/var/run',
    '/var/srv',
    '/var/usrlocal',
  ] as const,
} as const;
