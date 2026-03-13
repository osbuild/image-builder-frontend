import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { AARCH64, RHEL_10, RHEL_8, RHEL_9 } from '@/constants';
import {
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from '@/store/slices/wizard';

import { renderWithQueryParams } from './helpers';
import { createDefaultFetchHandler, fetchMock } from './mocks';

describe('Query parameter initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.enableMocks();
    fetchMock.mockResponse(createDefaultFetchHandler());
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  describe('release query parameter', () => {
    test('defaults to RHEL 10 when no query parameter is provided', async () => {
      const { store } = await renderWithQueryParams();

      await waitFor(() => {
        const distribution = selectDistribution(store.getState());
        expect(distribution).toBe(RHEL_10);
      });
    });

    test('defaults to RHEL 10 when invalid query parameter is provided', async () => {
      const { store } = await renderWithQueryParams('?release=rhel9001');

      await waitFor(() => {
        const distribution = selectDistribution(store.getState());
        expect(distribution).toBe(RHEL_10);
      });
    });

    test('sets distribution to RHEL 8 when release=rhel8', async () => {
      const { store } = await renderWithQueryParams('?release=rhel8');

      await waitFor(() => {
        const distribution = selectDistribution(store.getState());
        expect(distribution).toBe(RHEL_8);
      });
    });

    test('sets distribution to RHEL 9 when release=rhel9', async () => {
      const { store } = await renderWithQueryParams('?release=rhel9');

      await waitFor(() => {
        const distribution = selectDistribution(store.getState());
        expect(distribution).toBe(RHEL_9);
      });
    });

    test('sets distribution to RHEL 10 when release=rhel10', async () => {
      const { store } = await renderWithQueryParams('?release=rhel10');

      await waitFor(() => {
        const distribution = selectDistribution(store.getState());
        expect(distribution).toBe(RHEL_10);
      });
    });
  });

  describe('architecture query parameter', () => {
    test('defaults to x86_64 when no query parameter is provided', async () => {
      const { store } = await renderWithQueryParams();

      await waitFor(() => {
        const architecture = selectArchitecture(store.getState());
        expect(architecture).toBe('x86_64');
      });
    });

    test('defaults to x86_64 when invalid query parameter is provided', async () => {
      const { store } = await renderWithQueryParams('?arch=arm');

      await waitFor(() => {
        const architecture = selectArchitecture(store.getState());
        expect(architecture).toBe('x86_64');
      });
    });

    test('sets architecture to aarch64 when arch=aarch64', async () => {
      const { store } = await renderWithQueryParams('?arch=aarch64');

      await waitFor(() => {
        const architecture = selectArchitecture(store.getState());
        expect(architecture).toBe(AARCH64);
      });
    });
  });

  describe('target query parameter', () => {
    test('has no target selected by default', async () => {
      const { store } = await renderWithQueryParams();

      await waitFor(() => {
        const imageTypes = selectImageTypes(store.getState());
        expect(imageTypes).toHaveLength(0);
      });
    });

    test('has no target selected when invalid query parameter is provided', async () => {
      const { store } = await renderWithQueryParams('?target=azure');

      await waitFor(() => {
        const imageTypes = selectImageTypes(store.getState());
        expect(imageTypes).toHaveLength(0);
      });
    });

    test('selects image-installer when target=iso', async () => {
      const { store } = await renderWithQueryParams('?target=iso');

      await waitFor(() => {
        const imageTypes = selectImageTypes(store.getState());
        expect(imageTypes).toContain('image-installer');
      });
    });

    test('selects guest-image when target=qcow2', async () => {
      const { store } = await renderWithQueryParams('?target=qcow2');

      await waitFor(() => {
        const imageTypes = selectImageTypes(store.getState());
        expect(imageTypes).toContain('guest-image');
      });
    });
  });

  describe('combined query parameters', () => {
    test('handles multiple query parameters together', async () => {
      const { store } = await renderWithQueryParams(
        '?release=rhel9&arch=aarch64&target=qcow2',
      );

      await waitFor(() => {
        const distribution = selectDistribution(store.getState());
        const architecture = selectArchitecture(store.getState());
        const imageTypes = selectImageTypes(store.getState());

        expect(distribution).toBe(RHEL_9);
        expect(architecture).toBe(AARCH64);
        expect(imageTypes).toContain('guest-image');
      });
    });
  });
});
