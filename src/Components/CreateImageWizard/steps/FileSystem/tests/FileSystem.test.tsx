import React from 'react';

import { screen } from '@testing-library/react';

import { createUser, renderWithRedux, typeWithWait } from '@/test/testUtils';

import FileSystemStep from '../index';

describe('FileSystem Component', () => {
  describe('Form submission', () => {
    test('pressing Enter in mountpoint input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<FileSystemStep />, {
        fscMode: 'basic',
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
      });
      const user = createUser();

      const mountpointInputs = await screen.findAllByRole('textbox', {
        name: /mount point input/i,
      });
      await typeWithWait(user, mountpointInputs[1], '/var{Enter}');

      expect(mountpointInputs[1]).toBeInTheDocument();
      expect(store.getState().wizard.fileSystem.partitions[1].mountpoint).toBe(
        '/var',
      );
    });

    test('pressing Enter in minimum size input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<FileSystemStep />, {
        fscMode: 'basic',
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
      });
      const user = createUser();

      const minSizeInput = await screen.findByRole('textbox', {
        name: /minimum partition size/i,
      });
      await typeWithWait(user, minSizeInput, '20{Enter}');

      expect(minSizeInput).toBeInTheDocument();
      expect(store.getState().wizard.fileSystem.partitions[0].min_size).toBe(
        '20',
      );
    });
  });
});
