import { Distributions } from '../store/imageBuilderApi';

/**
 * Maps image-builder distribution identifiers to libosinfo shortIDs.
 * These shortIDs are used by cockpit-machines to identify operating systems.
 *
 * @param distribution - The image-builder distribution (e.g., 'rhel-9', 'rhel-8.10', 'fedora-41')
 * @returns The libosinfo shortID (e.g., 'rhel9.0', 'rhel8.10', 'fedora41') or undefined if not mappable
 */
export const distributionToOSShortId = (
  distribution: Distributions | 'image-mode' | undefined,
): string | undefined => {
  if (!distribution || distribution === 'image-mode') {
    return undefined;
  }

  // Handle RHEL distributions
  // Formats: 'rhel-8', 'rhel-84', 'rhel-8.10', 'rhel-9', 'rhel-9-nightly', 'rhel-9-beta', 'rhel-10', etc.

  // First try to match the format with explicit dot separator (e.g., 'rhel-8.10', 'rhel-9.6')
  const rhelDotMatch = distribution.match(
    /^rhel-(\d+)\.(\d+)(?:-(?:nightly|beta))?$/,
  );
  if (rhelDotMatch) {
    return `rhel${rhelDotMatch[1]}.${rhelDotMatch[2]}`;
  }

  // Match two-digit format for RHEL 8.x and 9.x (e.g., 'rhel-84' -> 8.4, 'rhel-91' -> 9.1)
  // These are legacy formats where the first digit is major (8 or 9) and second is minor
  // Only match when first digit is 8 or 9 to distinguish from 'rhel-10' (major version 10)
  const rhelTwoDigitMatch = distribution.match(
    /^rhel-([89])(\d)(?:-(?:nightly|beta))?$/,
  );
  if (rhelTwoDigitMatch) {
    return `rhel${rhelTwoDigitMatch[1]}.${rhelTwoDigitMatch[2]}`;
  }

  // Match major version only (e.g., 'rhel-8', 'rhel-9', 'rhel-10', 'rhel-10-nightly')
  const rhelMajorMatch = distribution.match(
    /^rhel-(\d+)(?:-(?:nightly|beta))?$/,
  );
  if (rhelMajorMatch) {
    return `rhel${rhelMajorMatch[1]}.0`;
  }

  // Handle CentOS Stream distributions
  // Formats: 'centos-9', 'centos-10'
  const centosMatch = distribution.match(/^centos-(\d+)$/);
  if (centosMatch) {
    return `centos-stream${centosMatch[1]}`;
  }

  // Handle Fedora distributions
  // Formats: 'fedora-41', 'fedora-42', etc.
  const fedoraMatch = distribution.match(/^fedora-(\d+)$/);
  if (fedoraMatch) {
    return `fedora${fedoraMatch[1]}`;
  }

  // Unknown distribution
  return undefined;
};
