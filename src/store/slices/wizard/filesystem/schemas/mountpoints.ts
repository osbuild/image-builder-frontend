import path from 'path';

import z from 'zod';

import { RESERVED_MOUNTPOINTS } from '../constants';

const mountpointBaseSchema = z
  .string()
  .refine((mountpoint) => mountpoint.startsWith('/'), {
    error: 'Mountpoint path must be absolute',
    abort: true,
  })
  .transform((mountpoint) => {
    if (mountpoint === '/') return mountpoint;

    return mountpoint.replace(/\/+$/, '');
  })
  .refine((mountpoint) => path.posix.normalize(mountpoint) === mountpoint, {
    error: 'Mountpoint path must be canonical',
    abort: true,
  });

export const packageModeMountpointSchema = mountpointBaseSchema
  .refine((mountpoint) => !mountpoint.startsWith('/usr/'), {
    error: 'Only /usr can be mounted; its subdirectories cannot',
    abort: true,
  })
  .refine(
    (mountpoint) =>
      !RESERVED_MOUNTPOINTS.packageMode.some(
        (reserved) =>
          mountpoint === reserved || mountpoint.startsWith(`${reserved}/`),
      ),
    {
      error: ({ input }) =>
        `${input} is a reserved mountpoint or a subdirectory of one`,
    },
  );

export const imageModeMountpointSchema = mountpointBaseSchema
  .refine((mountpoint) => !mountpoint.startsWith('/boot/'), {
    error: 'Subdirectories of /boot cannot be mounted separately',
    abort: true,
  })
  .refine((mountpoint) => mountpoint !== '/var', {
    // NOTE: some /var subdirectories are allowed, some aren't so this message
    // tries to guide the user to mount subdirectories instead
    error: '/var cannot be mounted directly; try a subdirectory instead',
    abort: true,
  })
  .refine(
    (mountpoint) =>
      !RESERVED_MOUNTPOINTS.imageMode.some(
        (reserved) =>
          mountpoint === reserved || mountpoint.startsWith(`${reserved}/`),
      ),
    {
      error: ({ input }) =>
        `${input} is a reserved mountpoint or a subdirectory of one`,
    },
  )
  .refine(
    (mountpoint) =>
      mountpoint === '/' ||
      mountpoint === '/boot' ||
      mountpoint.startsWith('/var/'),
    {
      error: ({ input }) => `${input} is not allowed in image mode`,
    },
  );
