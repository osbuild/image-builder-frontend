import cockpit from 'cockpit';
import { describe, expect, it, vi } from 'vitest';

import type { Subscription } from '@/store/api/backend/hosted/imageBuilderApi';

import {
  getRegistrationArgs,
  mapSubscriptionToRegistrations,
} from '../registrations';

vi.mock('cockpit', () => ({
  default: {
    file: vi.fn(),
  },
}));

const subscription: Subscription = {
  organization: 12345,
  'activation-key': 'my-key',
  'server-url': 'subscription.rhsm.redhat.com',
  'base-url': 'https://cdn.redhat.com/',
  insights: true,
  rhc: true,
};

describe('mapSubscriptionToRegistrations', () => {
  it('maps the subscription customization to the registrations file format', () => {
    expect(mapSubscriptionToRegistrations(subscription)).toEqual({
      redhat: {
        subscription: {
          organization: '12345',
          activation_key: 'my-key',
          server_url: 'subscription.rhsm.redhat.com',
          base_url: 'https://cdn.redhat.com/',
          insights: true,
          rhc: true,
        },
      },
    });
  });
});

describe('getRegistrationArgs', () => {
  it('returns no args without a subscription', async () => {
    expect(await getRegistrationArgs(undefined, 'compose-id')).toEqual([]);
    expect(cockpit.file).not.toHaveBeenCalled();
  });

  it('writes the registrations file and returns the CLI args', async () => {
    const replace = vi.fn().mockResolvedValue(undefined);
    vi.mocked(cockpit.file).mockReturnValue({ replace } as never);

    const regsPath =
      '/var/cache/cockpit-image-builder/cockpit-image-builder-compose-id-registrations.json';
    expect(await getRegistrationArgs(subscription, 'compose-id')).toEqual([
      '--registrations',
      regsPath,
    ]);
    expect(cockpit.file).toHaveBeenCalledWith(regsPath, {
      superuser: 'require',
    });
    expect(replace).toHaveBeenCalledWith(
      JSON.stringify(mapSubscriptionToRegistrations(subscription)),
    );
  });
});
