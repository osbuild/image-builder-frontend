import {
  EPEL_10_REPO_DEFINITION,
  EPEL_8_REPO_DEFINITION,
  EPEL_9_REPO_DEFINITION,
} from '../constants';

type EpelRepoDefinition = typeof EPEL_8_REPO_DEFINITION;

/**
 * A map associating a distribution prefix with its corresponding EPEL repository definition.
 * The keys are prefixes (e.g., 'rhel-9') that are matched against the start of a
 * full distribution string (e.g., 'rhel-9-beta').
 * For new major versions of RHEL, we can add a new EPEL repository definition and an entry in the map.
 *
 * @see {@link EPEL_8_REPO_DEFINITION}
 * @see {@link EPEL_9_REPO_DEFINITION}
 * @see {@link EPEL_10_REPO_DEFINITION}
 */
const epelMap: ReadonlyMap<string, EpelRepoDefinition> = new Map([
  ['rhel-10', EPEL_10_REPO_DEFINITION],
  ['rhel-9', EPEL_9_REPO_DEFINITION],
  ['rhel-8', EPEL_8_REPO_DEFINITION],
]);

/**
 * Gets the key for `epelMap` from the distribution string.
 *
 * @param distribution The distribution string.
 * @returns The key for `epelMap`.
 *
 * @example
 * getKeyForDistribution('rhel-9-beta') // 'rhel-9'
 * getKeyForDistribution('rhel-95') // 'rhel-9'
 * getKeyForDistribution('rhel-8.10') // 'rhel-8'
 * getKeyForDistribution('rhel-10') // 'rhel-10'
 * getKeyForDistribution('rhel-11') // 'rhel-11'
 */
const getKeyForDistribution = (distribution: string): string =>
  distribution.match(/^(rhel-(?:8|9|1\d)).*/)?.[1] ?? '';

/**
 * Determines the correct EPEL repository definition for a given distribution string.
 * It works by finding a matching prefix from the `epelMap`.
 *
 * @param distribution The distribution string (e.g., "rhel-9-beta", "rhel-8.10", "rhel-10").
 * @returns The matching EPEL repository definition, or `undefined` if no match is found.
 */
export const getEpelDefinitionForDistribution = (
  distribution: string
): EpelRepoDefinition | undefined =>
  epelMap.get(getKeyForDistribution(distribution));

/**
 * Gets the URL for the EPEL repository for a given distribution string.
 *
 * @param distribution The distribution string.
 * @returns The URL for the EPEL repository, or `undefined` if no match is found.
 */
export const getEpelUrlForDistribution = (
  distribution: string
): string | undefined => getEpelDefinitionForDistribution(distribution)?.url;

/**
 * Gets the version number for the EPEL repository for a given distribution string.
 *
 * @param distribution The distribution string.
 * @returns The version number for the EPEL repository, or `undefined` if no match is found.
 */
export const getEpelVersionForDistribution = (
  distribution: string
): string | undefined => {
  const split = getKeyForDistribution(distribution).split('-');
  return split.length > 1 ? split[1] : undefined;
};
