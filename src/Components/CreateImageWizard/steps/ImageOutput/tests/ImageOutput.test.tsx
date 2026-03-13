import { screen } from '@testing-library/react';

import { CENTOS_9, RHEL_10, RHEL_8, RHEL_9 } from '@/constants';
import { selectBlueprintName } from '@/store/slices/wizard';
import { server } from '@/test/mocks/server';
import { clickWithWait, createUser, fetchMock } from '@/test/testUtils';

import { renderImageOutputStep } from './helpers';
import { createDefaultFetchHandler } from './mocks';

fetchMock.enableMocks();

beforeAll(() => {
  server.close();
});

afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(createDefaultFetchHandler());
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('ImageOutput Step', () => {
  describe('Rendering', () => {
    test('displays step title', async () => {
      renderImageOutputStep();

      expect(
        await screen.findByRole('heading', { name: /image output/i }),
      ).toBeInTheDocument();
    });

    test('displays step description', async () => {
      renderImageOutputStep();

      await screen.findByRole('heading', { name: /image output/i });

      expect(
        screen.getByText(
          /image builder enables you to create customized blueprints/i,
        ),
      ).toBeInTheDocument();
    });

    test('displays documentation button', async () => {
      renderImageOutputStep();

      expect(
        await screen.findByRole('link', { name: /documentation/i }),
      ).toBeInTheDocument();
    });

    test('displays release select', async () => {
      renderImageOutputStep();

      expect(await screen.findByTestId('release_select')).toBeInTheDocument();
    });

    test('displays architecture select', async () => {
      renderImageOutputStep();

      expect(await screen.findByTestId('arch_select')).toBeInTheDocument();
    });

    test('displays target environment section', async () => {
      renderImageOutputStep();

      expect(
        await screen.findByText(/select target environments/i),
      ).toBeInTheDocument();
    });
  });

  describe('Conditional rendering', () => {
    test('displays release lifecycle for RHEL 9', async () => {
      renderImageOutputStep({ distribution: RHEL_9 });

      expect(
        await screen.findByRole('button', {
          name: /hide information about release lifecycle/i,
        }),
      ).toBeInTheDocument();
    });

    test('displays release lifecycle for RHEL 8', async () => {
      renderImageOutputStep({ distribution: RHEL_8 });

      expect(
        await screen.findByRole('button', {
          name: /hide information about release lifecycle/i,
        }),
      ).toBeInTheDocument();
    });

    test('does not display release lifecycle for RHEL 10', async () => {
      renderImageOutputStep({ distribution: RHEL_10 });

      await screen.findByRole('heading', { name: /image output/i });

      expect(
        screen.queryByRole('button', {
          name: /information about release lifecycle/i,
        }),
      ).not.toBeInTheDocument();
    });

    test('displays CentOS acknowledgement for CentOS distribution', async () => {
      renderImageOutputStep({ distribution: CENTOS_9 });

      expect(
        await screen.findByText(
          /centos stream builds are intended for the development/i,
        ),
      ).toBeInTheDocument();
    });

    test('does not display CentOS acknowledgement for RHEL distribution', async () => {
      renderImageOutputStep({ distribution: RHEL_10 });

      await screen.findByRole('heading', { name: /image output/i });

      expect(
        screen.queryByText(
          /centos stream builds are intended for the development/i,
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('Auto-generated blueprint name', () => {
    test('generates default name from distribution and architecture', async () => {
      const { store } = renderImageOutputStep({
        distribution: RHEL_10,
        architecture: 'x86_64',
      });

      await screen.findByRole('heading', { name: /image output/i });

      const name = selectBlueprintName(store.getState());
      expect(name).toMatch(/^rhel-10-x86_64-\d{8}-\d{4}$/);
    });

    test('updates name when architecture changes', async () => {
      const user = createUser();
      const { store } = renderImageOutputStep({
        distribution: RHEL_10,
        architecture: 'x86_64',
      });

      await screen.findByRole('heading', { name: /image output/i });

      const archSelect = screen.getByTestId('arch_select');
      await clickWithWait(user, archSelect);
      const aarch64Option = await screen.findByRole('option', {
        name: 'aarch64',
      });
      await clickWithWait(user, aarch64Option);

      const name = selectBlueprintName(store.getState());
      expect(name).toMatch(/^rhel-10-aarch64-\d{8}-\d{4}$/);
    });

    test('updates name when distribution changes', async () => {
      const user = createUser();
      const { store } = renderImageOutputStep({
        distribution: RHEL_10,
        architecture: 'x86_64',
      });

      await screen.findByRole('heading', { name: /image output/i });

      const releaseSelect = screen.getByTestId('release_select');
      await clickWithWait(user, releaseSelect);
      const rhel9Option = await screen.findByRole('option', {
        name: /Red Hat Enterprise Linux \(RHEL\) 9/i,
      });
      await clickWithWait(user, rhel9Option);

      const name = selectBlueprintName(store.getState());
      expect(name).toMatch(/^rhel-9-x86_64-\d{8}-\d{4}$/);
    });

    test('preserves custom name on initial render', async () => {
      const { store } = renderImageOutputStep({
        distribution: RHEL_10,
        architecture: 'x86_64',
        details: {
          blueprintName: 'my-custom-blueprint',
          blueprintDescription: '',
          isCustomName: true,
        },
      });

      await screen.findByRole('heading', { name: /image output/i });

      const name = selectBlueprintName(store.getState());
      expect(name).toBe('my-custom-blueprint');
    });
  });
});
