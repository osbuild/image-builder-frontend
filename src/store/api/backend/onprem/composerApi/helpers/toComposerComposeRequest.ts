import { IMAGE_MODE } from '@/constants';
import type { OpenScapProfile } from '@/store/api/backend/hosted';

import {
  type ComposerCreateBlueprintRequest,
  type ComposerComposeRequest as ComposeRequest,
  type ComposerImageRequest,
  type ComposerCustomizations as Customizations,
  type ComposerImageTypes as ImageTypes,
} from '../../types';

export const toComposerComposeRequest = (
  blueprint: ComposerCreateBlueprintRequest,
  distribution: string,
  image_requests: ComposerImageRequest[],
): ComposeRequest => {
  // subscription, users & openscap are the only options
  // that aren't compatibile with the on-prem customizations,
  // so we have to handle those separately
  const { subscription, openscap, users, ...hostedCustomizations } =
    blueprint.customizations;

  const customizations: Customizations = {
    ...hostedCustomizations,
  };

  if (openscap) {
    customizations.openscap = {
      // the casting here is fine since compliance isn't available on-prem
      profile_id: (openscap as OpenScapProfile).profile_id,
    };
  }

  if (users) {
    customizations.users = users.map((user) => {
      const { ssh_key, groups, password } = user;
      return {
        name: user.name,
        ...(groups && { groups: groups }),
        ...(password && { password: password }),
        ...(ssh_key && { key: ssh_key }),
      };
    });
  }

  if (subscription) {
    customizations!.subscription = {
      organization: subscription.organization.toString(),
      activation_key: subscription['activation-key'],
      server_url: subscription['server-url'],
      base_url: subscription['base-url'],
      rhc: subscription.rhc,
      insights: subscription.insights,
      insights_client_proxy: subscription.insights_client_proxy,
    };
  }

  let distro: string | undefined = distribution;
  if (distro === IMAGE_MODE) {
    distro = undefined;
  }

  let bootc = undefined;
  if (blueprint.bootc) {
    bootc = blueprint.bootc;
  }

  return {
    distribution: distro,
    bootc: bootc,
    customizations,
    image_requests: image_requests.map((ir) => ({
      architecture: ir.architecture,
      image_type: ir.image_type as ImageTypes,
      repositories: [],
      upload_targets: [
        {
          type: ir.upload_request.type,
          upload_options: ir.upload_request.options,
        },
      ],
    })),
  };
};
