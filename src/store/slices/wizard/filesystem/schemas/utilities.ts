import z from 'zod';

import { MountpointEntry } from './types';

export const uniqueMountpoints = () => {
  return (partitions: MountpointEntry[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>();

    for (const partition of partitions) {
      if ('type' in partition && partition.type === 'btrfs') continue;

      if ('mountpoint' in partition && partition.mountpoint) {
        if (seen.has(partition.mountpoint)) {
          ctx.addIssue({
            code: 'custom',
            path: [partition.id],
            message: 'Duplicate mountpoint',
            params: { type: 'duplicate', value: partition.mountpoint },
          });
          continue;
        }

        seen.add(partition.mountpoint);
        continue;
      }

      if (!partition.logical_volumes) continue;
      for (const volume of partition.logical_volumes) {
        if (!volume.mountpoint) continue;

        if (seen.has(volume.mountpoint)) {
          ctx.addIssue({
            code: 'custom',
            path: [partition.id, 'logical_volumes', volume.id],
            message: 'Duplicate mountpoint',
            params: { type: 'duplicate', value: volume.mountpoint },
          });
          continue;
        }

        seen.add(volume.mountpoint);
      }
    }
  };
};
