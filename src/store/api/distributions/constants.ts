import { CustomizationType } from './types';

export const ALL_CUSTOMIZATIONS = [
  'packages',
  'repositories',
  'filesystem',
  'kernel',
  'timezone',
  'locale',
  'firewall',
  'services',
  'hostname',
  'firstBoot',
  'openscap',
  'registration',
  'users',
  'fips',
  'aap',
] as const satisfies readonly CustomizationType[];

// Mapping backend naming of customizations to frontend naming.
// A single backend key can map to multiple frontend customization types.
export const BACKEND_TO_FRONTEND_OPTIONS: Record<
  string,
  CustomizationType | CustomizationType[]
> = {
  packages: 'packages',
  'customizations.filesystem': 'filesystem',
  'customizations.kernel': 'kernel',
  'customizations.timezone': 'timezone',
  'customizations.locale': 'locale',
  'customizations.firewall': 'firewall',
  'customizations.services': 'services',
  'customizations.hostname': 'hostname',
  'customizations.openscap': 'openscap',
  'customizations.repositories': 'repositories',
  'customizations.user': 'users',
  'customizations.rhsm': 'registration',
  'customizations.fips': 'fips',
  'customizations.files': ['firstBoot', 'aap'],
};
