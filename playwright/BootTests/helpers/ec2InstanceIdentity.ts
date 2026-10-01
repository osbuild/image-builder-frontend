/**
 * EC2 name and tags for Playwright boot-test guests.
 * Name: boot-test-for-image-builder-frontend-{branch}-{sha}-{test}
 */

const EC2_NAME_MAX_LENGTH = 255;

export type Ec2Tag = { Key: string; Value: string };

/** Parse a PR number from refs/pull/{n}/merge or refs/pull/{n}/head. */
export const parsePrNumberFromRef = (
  githubRef?: string,
): string | undefined => {
  if (!githubRef) {
    return undefined;
  }
  const match = githubRef.match(/refs\/pull\/(\d+)\//);
  return match?.[1];
};

/** Lowercase alnum and hyphens; collapse repeats; trim edge hyphens. */
export const sanitizeEc2Segment = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const getCommitSha = (): string =>
  process.env.GITHUB_SHA?.trim() || 'local';

export const getBranchLabel = (): string => {
  const prFromEnv = process.env.GITHUB_PR_NUMBER?.trim();
  if (prFromEnv) {
    return `PR-${prFromEnv}`;
  }

  const prFromRef = parsePrNumberFromRef(process.env.GITHUB_REF);
  if (prFromRef) {
    return `PR-${prFromRef}`;
  }

  const headRef = process.env.GITHUB_HEAD_REF?.trim();
  if (headRef) {
    const sanitized = sanitizeEc2Segment(headRef);
    if (sanitized) {
      return sanitized;
    }
  }

  const refName = process.env.GITHUB_REF_NAME?.trim();
  if (refName) {
    const sanitized = sanitizeEc2Segment(refName);
    if (sanitized) {
      return sanitized;
    }
  }

  return 'local';
};

export const getTestSlug = (testFile: string): string => {
  const baseName = testFile.replace(/^.*[/\\]/, '');
  const withoutExtension = baseName.replace(/\.boot\.ts$/, '');
  return sanitizeEc2Segment(withoutExtension) || 'boot-test';
};

const normalizeBranchLabel = (branchLabel: string): string => {
  const prMatch = branchLabel.match(/^PR-(\d+)$/i);
  if (prMatch) {
    return `PR-${prMatch[1]}`;
  }
  return sanitizeEc2Segment(branchLabel) || 'local';
};

export const buildBootTestImageSlug = (
  branchLabel: string,
  sha: string,
): string => {
  const branch = normalizeBranchLabel(branchLabel);
  const commit = sanitizeEc2Segment(sha) || 'local';
  return `image-builder-frontend-${branch}-${commit}`;
};

export const buildBootTestInstanceName = (
  imageSlug: string,
  testSlug: string,
): string => {
  const test = sanitizeEc2Segment(testSlug) || 'boot-test';
  return truncateEc2Name(`boot-test-for-${imageSlug}-${test}`, test);
};

// EC2 Name is at most 255 characters. Keep the test slug when truncating.
const truncateEc2Name = (name: string, testSlug: string): string => {
  if (name.length <= EC2_NAME_MAX_LENGTH) {
    return name;
  }

  const suffix = `-${sanitizeEc2Segment(testSlug) || 'boot-test'}`;
  const prefix = 'boot-test-for-image-builder-frontend-';
  const middleMax = EC2_NAME_MAX_LENGTH - prefix.length - suffix.length;

  if (middleMax <= 0) {
    return name.slice(0, EC2_NAME_MAX_LENGTH);
  }

  const middle = name.slice(prefix.length, prefix.length + middleMax);
  return `${prefix}${middle}${suffix}`;
};

// Defaults for HMS-11407. Override with AWS_EC2_TAG_* env vars.
// AppCode IMGB-001, ServiceName image-builder-frontend,
// ServiceComponent boot-test, ServicePhase dev, Workload frontend-boot-test.
export const buildBootTestEc2Tags = (instanceName: string): Ec2Tag[] => {
  const tags: Ec2Tag[] = [
    { Key: 'Name', Value: instanceName },
    {
      Key: 'AppCode',
      Value: process.env.AWS_EC2_TAG_APP_CODE ?? 'IMGB-001',
    },
    {
      Key: 'ServiceName',
      Value: process.env.AWS_EC2_TAG_SERVICE_NAME ?? 'image-builder-frontend',
    },
    {
      Key: 'ServiceComponent',
      Value: process.env.AWS_EC2_TAG_SERVICE_COMPONENT ?? 'boot-test',
    },
    {
      Key: 'ServicePhase',
      Value: process.env.AWS_EC2_TAG_SERVICE_PHASE ?? 'dev',
    },
    {
      Key: 'Workload',
      Value: process.env.AWS_EC2_TAG_WORKLOAD ?? 'frontend-boot-test',
    },
  ];

  return tags.map(({ Key, Value }) => ({
    Key,
    Value: Value.slice(0, 256),
  }));
};

export const buildBootTestInstanceIdentity = (
  testFile: string,
): { instanceName: string; tags: Ec2Tag[] } => {
  const branchLabel = getBranchLabel();
  const sha = getCommitSha();
  const testSlug = getTestSlug(testFile);
  const imageSlug = buildBootTestImageSlug(branchLabel, sha);
  const instanceName = buildBootTestInstanceName(imageSlug, testSlug);
  const tags = buildBootTestEc2Tags(instanceName);

  return { instanceName, tags };
};
