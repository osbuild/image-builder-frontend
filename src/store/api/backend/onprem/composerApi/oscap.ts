import cockpit from 'cockpit';
import TOML from 'smol-toml';

import { mapOnPremToHosted } from '@/Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import { lookupDatastreamDistro } from './helpers';

import {
  BlueprintItem,
  DistributionProfileItem,
  GetOscapCustomizationsApiArg,
  GetOscapCustomizationsApiResponse,
  GetOscapProfilesApiArg,
  GetOscapProfilesApiResponse,
} from '../../hosted';

export const oscapEndpoints = (builder: OnPremBuilder) => ({
  getOscapProfiles: builder.query<
    GetOscapProfilesApiResponse,
    GetOscapProfilesApiArg
  >({
    queryFn: onPremQueryHandler(async ({ queryArgs: { distribution } }) => {
      const dsDistro = lookupDatastreamDistro(distribution);
      const result = (await cockpit.spawn(
        [
          'oscap',
          'info',
          '--profiles',
          `/usr/share/xml/scap/ssg/content/ssg-${dsDistro}-ds.xml`,
        ],
        {
          superuser: 'try',
        },
      )) as string;

      return result
        .split('\n')
        .filter((profile) => profile !== '')
        .map((profile) => profile.split(':')[0])
        .map((profile) => profile as DistributionProfileItem);
    }),
  }),
  getOscapCustomizations: builder.query<
    GetOscapCustomizationsApiResponse,
    GetOscapCustomizationsApiArg
  >({
    queryFn: onPremQueryHandler(
      async ({ queryArgs: { distribution, profile } }) => {
        const dsDistro = lookupDatastreamDistro(distribution);
        let result = (await cockpit.spawn(
          [
            'oscap',
            'xccdf',
            'generate',
            'fix',
            '--fix-type',
            'blueprint',
            '--profile',
            profile,
            `/usr/share/xml/scap/ssg/content/ssg-${dsDistro}-ds.xml`,
          ],
          {
            superuser: 'try',
          },
        )) as string;

        const parsed = TOML.parse(result);
        const blueprint = mapOnPremToHosted(
          parsed as BlueprintItem,
          distribution,
        );

        result = (await cockpit.spawn(
          [
            'oscap',
            'info',
            '--profile',
            profile,
            `/usr/share/xml/scap/ssg/content/ssg-${dsDistro}-ds.xml`,
          ],
          {
            superuser: 'try',
          },
        )) as string;

        const descriptionLine = result
          .split('\n')
          .filter((s) => s.includes('Description: '));

        const description =
          descriptionLine.length > 0
            ? descriptionLine[0].split('Description: ')[1]
            : '';

        return {
          ...blueprint.customizations,
          openscap: {
            profile_id: profile,
            // the profile name is stored in the description
            profile_name: blueprint.description,
            profile_description: description,
          },
        };
      },
    ),
  }),
});
