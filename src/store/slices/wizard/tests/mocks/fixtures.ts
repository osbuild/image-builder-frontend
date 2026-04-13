import {
  createBasicPartition,
  createLogicalVolume,
  createPlainPartition,
  createVolumeGroup,
} from './filesystem';

// Pre-configured fixtures for common test scenarios
export const basicPartitions = {
  singleRoot: [createBasicPartition({ id: 'root', mountpoint: '/' })],

  rootAndHome: [
    createBasicPartition({ id: 'root', mountpoint: '/', min_size: '10' }),
    createBasicPartition({ id: 'home', mountpoint: '/home', min_size: '5' }),
  ],

  smallPartition: [
    createBasicPartition({
      id: 'root',
      mountpoint: '/',
      min_size: '500',
      unit: 'MiB',
    }),
  ],
};

export const advancedPartitions = {
  singlePlain: [
    createPlainPartition({ id: 'boot', mountpoint: '/boot', min_size: '1' }),
  ],

  withLvm: [
    createPlainPartition({ id: 'boot', mountpoint: '/boot', min_size: '1' }),
    createVolumeGroup([
      createLogicalVolume({
        id: 'lv-root',
        mountpoint: '/',
        min_size: '10',
        name: 'root',
      }),
      createLogicalVolume({
        id: 'lv-home',
        mountpoint: '/home',
        min_size: '5',
        name: 'home',
      }),
    ]),
  ],

  multipleLvmGroups: [
    createVolumeGroup(
      [createLogicalVolume({ id: 'lv1', mountpoint: '/', min_size: '10' })],
      { id: 'vg1', name: 'vg_system' },
    ),
    createVolumeGroup(
      [
        createLogicalVolume({ id: 'lv2', mountpoint: '/var', min_size: '5' }),
        createLogicalVolume({ id: 'lv3', mountpoint: '/home', min_size: '20' }),
      ],
      { id: 'vg2', name: 'vg_data' },
    ),
  ],
};
