import React from 'react';

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { vi } from 'vitest';

import { clickWithWait, createTestStore, createUser } from '@/test/testUtils';

import ContainerSection from '../components/ImageSourceSelect/OnPrem/ContainerSection';

const REF_A = 'registry.redhat.io/rhel10/rhel-bootc-kvm:latest';
const REF_B = 'registry.redhat.io/rhel10/rhel-bootc-aws:latest';

// Resolvers for the in-flight `podman pull` of each reference, so a pull can
// be held open for as long as a test needs it.
const pullResolvers: Record<string, () => void> = {};

vi.mock('cockpit', async (importOriginal) => {
  const actual = await importOriginal<{
    default: { spawn: (...args: never[]) => unknown };
  }>();
  return {
    default: {
      ...actual.default,
      spawn: (args: string[], attrs: object) => {
        if (args[0] === 'podman' && args[1] === 'pull') {
          return new Promise<string>((resolve) => {
            pullResolvers[args[2]] = () => resolve('');
          });
        }
        return actual.default.spawn(...([args, attrs] as never[]));
      },
    },
  };
});

// Only the two status queries are stubbed; the pull mutation under test is
// the real one, backed by the real store.
vi.mock('@/store/api/backend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/api/backend')>();
  return {
    ...actual,
    useGetImageExistsQuery: () => ({
      data: false,
      isLoading: false,
      isError: false,
    }),
    useGetRegistryAuthStatusQuery: () => ({
      data: { status: 'authenticated', username: 'testuser' },
      isLoading: false,
      isError: false,
    }),
  };
});

const renderSection = (reference: string) => {
  const store = createTestStore(
    {},
    { preloadedState: { env: { isOnPremise: true } } },
  );
  const view = render(
    <Provider store={store}>
      <ContainerSection label='Bootc container' reference={reference} />
    </Provider>,
  );
  return { ...view, store };
};

const pullButton = () =>
  screen.getByRole('button', { name: /pull latest image/i });

describe('ContainerSection pull state', () => {
  afterEach(() => {
    Object.values(pullResolvers).forEach((resolve) => resolve());
  });

  test('keeps showing a pull that is still running after remounting', async () => {
    const user = createUser();
    const { unmount, store } = renderSection(REF_A);

    await clickWithWait(user, pullButton());
    expect(
      await screen.findByRole('button', { name: /pulling image/i }),
    ).toBeInTheDocument();

    // Leaving the step and coming back must not lose the pull: it is still
    // running, and offering it again would start a second one.
    unmount();
    render(
      <Provider store={store}>
        <ContainerSection label='Bootc container' reference={REF_A} />
      </Provider>,
    );

    expect(
      await screen.findByRole('button', { name: /pulling image/i }),
    ).toBeInTheDocument();
  });

  test('keeps each reference’s pull separate from the other', async () => {
    const user = createUser();
    const { rerender, store } = renderSection(REF_A);

    await clickWithWait(user, pullButton());
    expect(
      await screen.findByRole('button', { name: /pulling image/i }),
    ).toBeInTheDocument();

    // Switching target environments while the first pull runs shows the new
    // reference as idle...
    const showRef = (reference: string) =>
      rerender(
        <Provider store={store}>
          <ContainerSection label='Bootc container' reference={reference} />
        </Provider>,
      );

    showRef(REF_B);
    expect(pullButton()).toBeInTheDocument();

    // ...and pulling it must not take over the first reference's state.
    await clickWithWait(user, pullButton());
    expect(
      await screen.findByRole('button', { name: /pulling image/i }),
    ).toBeInTheDocument();

    showRef(REF_A);
    expect(
      await screen.findByRole('button', { name: /pulling image/i }),
    ).toBeInTheDocument();
  });
});
