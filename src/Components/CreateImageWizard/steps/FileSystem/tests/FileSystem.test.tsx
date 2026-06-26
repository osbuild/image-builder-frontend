import { screen, within } from '@testing-library/react';

import { combinedInitialState as initialState } from '@/store/slices/wizard';
import {
  clearWithWait,
  clickWithWait,
  createUser,
  typeWithWait,
} from '@/test/testUtils';

import { renderFileSystemStep } from './helpers';

describe('FileSystem Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderFileSystemStep();

      expect(
        await screen.findByRole('heading', {
          name: /File system configuration/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Configure the system and partitioning for your image/i,
        ),
      ).toBeInTheDocument();
    });

    test('displays automatic partitioning by default', async () => {
      renderFileSystemStep();

      expect(
        await screen.findByRole('button', { name: /Automatic partitioning/i }),
      ).toBeInTheDocument();
    });

    test('displays basic filesystem partitioning when mode is basic', async () => {
      renderFileSystemStep({
        filesystem: {
          ...initialState.filesystem,
          mode: 'basic',
        },
      });

      expect(
        await screen.findByRole('button', {
          name: /Basic filesystem partitioning/i,
        }),
      ).toBeInTheDocument();
    });

    test('displays advanced disk partitioning when mode is advanced', async () => {
      renderFileSystemStep({
        filesystem: {
          ...initialState.filesystem,
          mode: 'advanced',
        },
      });

      expect(
        await screen.findByRole('button', {
          name: /Advanced disk partitioning/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    test('shows error for duplicate mount points', async () => {
      const user = createUser();
      renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
              {
                id: '2',
                mountpoint: '/home',
                min_size: '5',
                unit: 'GiB',
              },
              {
                id: '3',
                mountpoint: '/var',
                min_size: '3',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      await screen.findByRole('heading', {
        name: /File system configuration/i,
      });

      const partitionsTable = screen.getByRole('grid', {
        name: /file system table/i,
      });
      const rows = within(partitionsTable).getAllByRole('row');
      const thirdRow = rows[3];

      const thirdRowMountpoint = within(thirdRow).getByDisplayValue('/var');
      await clickWithWait(user, thirdRowMountpoint);
      await clearWithWait(user, thirdRowMountpoint);
      await typeWithWait(user, thirdRowMountpoint, '/home');

      const mountPointAlerts = await screen.findAllByText(
        /duplicate mount points/i,
      );
      expect(mountPointAlerts.length).toBeGreaterThanOrEqual(1);
    });

    test('clears duplicate mount point error when resolved', async () => {
      const user = createUser();
      renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
              {
                id: '2',
                mountpoint: '/home',
                min_size: '5',
                unit: 'GiB',
              },
              {
                id: '3',
                mountpoint: '/home',
                min_size: '3',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const mountPointAlerts = await screen.findAllByText(
        /duplicate mount points/i,
      );
      expect(mountPointAlerts.length).toBeGreaterThanOrEqual(1);

      const partitionsTable = screen.getByRole('grid', {
        name: /file system table/i,
      });
      const rows = within(partitionsTable).getAllByRole('row');
      const thirdRow = rows[3];

      const thirdRowMountpoint = within(thirdRow).getByDisplayValue('/home');
      await clickWithWait(user, thirdRowMountpoint);
      await clearWithWait(user, thirdRowMountpoint);
      await typeWithWait(user, thirdRowMountpoint, '/var');

      await screen.findByRole('heading', {
        name: /File system configuration/i,
      });

      const alertsAfter = screen.queryAllByText(/duplicate mount points/i);
      expect(alertsAfter).toHaveLength(0);
    });

    test('shows validation error for invalid partition size', async () => {
      renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
              {
                id: '2',
                mountpoint: '/home',
                min_size: '-5',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      expect(
        await screen.findByText(/must be larger than 0/i),
      ).toBeInTheDocument();
    });
  });

  describe('State management', () => {
    test('updates partition size in store', async () => {
      const user = createUser();
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const minSizeInput = await screen.findByRole('textbox', {
        name: /minimum partition size/i,
      });

      await clickWithWait(user, minSizeInput);
      await clearWithWait(user, minSizeInput);
      await typeWithWait(user, minSizeInput, '15');

      expect(
        store.getState().wizard.filesystem.fileSystem.partitions[0].min_size,
      ).toBe('15');
    });

    test('updates partition unit in store', async () => {
      const user = createUser();
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const unitButton = await screen.findByRole('button', { name: 'GiB' });
      await clickWithWait(user, unitButton);

      const mibOption = await screen.findByRole('option', { name: 'MiB' });
      await clickWithWait(user, mibOption);

      expect(
        store.getState().wizard.filesystem.fileSystem.partitions[0].unit,
      ).toBe('MiB');
    });

    test('updates mountpoint in store', async () => {
      const user = createUser();
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
              {
                id: '2',
                mountpoint: '/home',
                min_size: '5',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const mountpointInputs = await screen.findAllByRole('textbox', {
        name: /mount point input/i,
      });

      await clickWithWait(user, mountpointInputs[1]);
      await clearWithWait(user, mountpointInputs[1]);
      await typeWithWait(user, mountpointInputs[1], '/home/cakerecipes');

      expect(
        store.getState().wizard.filesystem.fileSystem.partitions[1].mountpoint,
      ).toBe('/home/cakerecipes');
    });
  });

  describe('Partition management', () => {
    test('adds new partition when add button is clicked', async () => {
      const user = createUser();
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const initialLength =
        store.getState().wizard.filesystem.fileSystem.partitions.length;
      expect(initialLength).toBe(1);

      const addButton = await screen.findByRole('button', {
        name: /add partition/i,
      });
      await clickWithWait(user, addButton);

      const newLength =
        store.getState().wizard.filesystem.fileSystem.partitions.length;
      expect(newLength).toBe(2);
    });

    test('removes partition when remove button is clicked', async () => {
      const user = createUser();
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
              {
                id: '2',
                mountpoint: '/home',
                min_size: '5',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const initialLength =
        store.getState().wizard.filesystem.fileSystem.partitions.length;
      expect(initialLength).toBe(2);

      const removeButtons = await screen.findAllByRole('button', {
        name: /remove partition/i,
      });
      await clickWithWait(user, removeButtons[1]);

      const newLength =
        store.getState().wizard.filesystem.fileSystem.partitions.length;
      expect(newLength).toBe(1);
      expect(
        store.getState().wizard.filesystem.fileSystem.partitions[0].mountpoint,
      ).toBe('/');
    });

    test('root partition cannot be removed when it is the only one', async () => {
      renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const removeButton = await screen.findByRole('button', {
        name: /remove partition/i,
      });
      expect(removeButton).toBeDisabled();
    });

    test('new partition has default values', async () => {
      const user = createUser();
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const addButton = await screen.findByRole('button', {
        name: /add partition/i,
      });
      await clickWithWait(user, addButton);

      const partitions =
        store.getState().wizard.filesystem.fileSystem.partitions;
      const newPartition = partitions[partitions.length - 1];

      expect(newPartition.mountpoint).toBe('/home');
      expect(newPartition.min_size).toBe('1');
      expect(newPartition.unit).toBe('GiB');
    });

    test('subsequent partitions get next available mountpoint', async () => {
      const user = createUser();
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
              {
                id: '2',
                mountpoint: '/home',
                min_size: '5',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const addButton = await screen.findByRole('button', {
        name: /add partition/i,
      });
      await clickWithWait(user, addButton);

      const partitions =
        store.getState().wizard.filesystem.fileSystem.partitions;
      expect(partitions[2].mountpoint).toBe('/var');
    });
  });

  describe('Partitioning mode', () => {
    test('displays partitioning mode selector for basic partitioning', async () => {
      renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      expect(
        await screen.findByRole('button', {
          name: /select partitioning mode/i,
        }),
      ).toBeInTheDocument();
    });

    test('does not display partitioning mode selector for advanced partitioning', async () => {
      renderFileSystemStep({
        filesystem: {
          mode: 'advanced',
          disk: {
            minsize: '20',
            unit: 'GiB',
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
                type: 'plain',
                fs_type: 'xfs',
              },
            ],
            type: undefined,
          },
          fileSystem: {
            partitions: [],
          },
          partitioningMode: undefined,
        },
      });

      await screen.findByRole('heading', {
        name: /File system configuration/i,
      });

      expect(
        screen.queryByRole('button', {
          name: /select partitioning mode/i,
        }),
      ).not.toBeInTheDocument();
    });

    test('updates store when partitioning mode is changed', async () => {
      const user = createUser();
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      expect(
        store.getState().wizard.filesystem.partitioningMode,
      ).toBeUndefined();

      const modeSelector = await screen.findByRole('button', {
        name: /select partitioning mode/i,
      });
      await clickWithWait(user, modeSelector);

      const autoLvmOption = await screen.findByRole('option', {
        name: /auto-lvm partitioning/i,
      });
      await clickWithWait(user, autoLvmOption);

      expect(store.getState().wizard.filesystem.partitioningMode).toBe(
        'auto-lvm',
      );
    });
  });

  describe('Empty state', () => {
    test('shows at least one partition (root) by default', async () => {
      renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      const table = await screen.findByRole('grid', {
        name: /file system table/i,
      });
      const rows = within(table).getAllByRole('row');
      // Header row + 1 partition row
      expect(rows).toHaveLength(2);
    });
  });

  describe('Conditional rendering', () => {
    test('shows file system table in basic mode', async () => {
      renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      expect(
        await screen.findByRole('grid', { name: /file system table/i }),
      ).toBeInTheDocument();
    });

    test('does not show file system table in automatic mode', async () => {
      renderFileSystemStep({
        filesystem: {
          mode: 'automatic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [],
          },
          partitioningMode: undefined,
        },
      });

      await screen.findByRole('heading', {
        name: /File system configuration/i,
      });

      expect(
        screen.queryByRole('grid', { name: /file system table/i }),
      ).not.toBeInTheDocument();
    });

    test('shows add partition button in basic mode', async () => {
      renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });

      expect(
        await screen.findByRole('button', { name: /add partition/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    test('pressing Enter in mountpoint input does not trigger page reload', async () => {
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '642a10c4-4ffc-471b-803d-44405ae4abf4',
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
              {
                id: '46acd579-e5a6-474a-875c-017394d70382',
                mountpoint: '',
                min_size: '10',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });
      const user = createUser();

      const mountpointInputs = await screen.findAllByRole('textbox', {
        name: /mount point input/i,
      });
      await typeWithWait(user, mountpointInputs[1], '/var{Enter}');

      expect(mountpointInputs[1]).toBeInTheDocument();
      expect(
        store.getState().wizard.filesystem.fileSystem.partitions[1].mountpoint,
      ).toBe('/var');
    });

    test('pressing Enter in minimum size input does not trigger page reload', async () => {
      const { store } = renderFileSystemStep({
        filesystem: {
          mode: 'basic',
          disk: { minsize: '', unit: 'GiB', partitions: [], type: undefined },
          fileSystem: {
            partitions: [
              {
                id: '1',
                mountpoint: '/var',
                min_size: '',
                unit: 'GiB',
              },
            ],
          },
          partitioningMode: undefined,
        },
      });
      const user = createUser();

      const minSizeInput = await screen.findByRole('textbox', {
        name: /minimum partition size/i,
      });
      await typeWithWait(user, minSizeInput, '20{Enter}');

      expect(minSizeInput).toBeInTheDocument();
      expect(
        store.getState().wizard.filesystem.fileSystem.partitions[0].min_size,
      ).toBe('20');
    });
  });
});
