import path from 'path';

import cockpit from 'cockpit';

import type { Subscription } from '@/store/api/backend/hosted/imageBuilderApi';
import type { Registrations } from '@/store/api/backend/onprem';

export const mapSubscriptionToRegistrations = (
  subscription: Subscription,
): Registrations => ({
  redhat: {
    subscription: {
      organization: String(subscription.organization),
      activation_key: subscription['activation-key'],
      server_url: subscription['server-url'],
      base_url: subscription['base-url'],
      insights: subscription.insights,
      rhc: subscription.rhc ?? false,
      ...(subscription.insights_client_proxy && {
        proxy: subscription.insights_client_proxy,
      }),
    },
  },
});

// The on-prem blueprint has no subscription customization, so the
// registration details are passed separately via `--registrations`.
// The path is returned so the caller can clean the file up once the
// build is done — it contains the activation key.
export const getRegistrationArgs = async (
  subscription: Subscription | undefined,
  id: string,
): Promise<{ args: string[]; path: string | undefined }> => {
  if (!subscription) {
    return { args: [], path: undefined };
  }
  const regsPath = path.join(
    '/var/cache/cockpit-image-builder',
    `cockpit-image-builder-${id}-registrations.json`,
  );
  await cockpit
    .file(regsPath, { superuser: 'require' })
    .replace(JSON.stringify(mapSubscriptionToRegistrations(subscription)));
  return { args: ['--registrations', regsPath], path: regsPath };
};
