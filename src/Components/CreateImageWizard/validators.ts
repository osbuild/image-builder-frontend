import {
  DiskPartition,
  FilesystemPartition,
  VolumeGroupWithExtendedLV,
} from './steps/FileSystem/fscTypes';

export const isAwsAccountIdValid = (awsAccountId: string | undefined) => {
  return (
    awsAccountId !== undefined &&
    /^\d+$/.test(awsAccountId) &&
    awsAccountId.length === 12
  );
};

export const isAzureTenantGUIDValid = (azureTenantGUID: string | undefined) => {
  return (
    azureTenantGUID === undefined ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      azureTenantGUID,
    )
  );
};

export const isAzureSubscriptionIdValid = (
  azureSubscriptionId: string | undefined,
) => {
  return (
    azureSubscriptionId === undefined ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      azureSubscriptionId,
    )
  );
};

export const isAzureResourceGroupValid = (
  azureResourceGroup: string | undefined,
) => {
  return (
    azureResourceGroup === undefined ||
    /^[-\w._()]+[-\w_()]$/.test(azureResourceGroup)
  );
};

export const isGcpEmailValid = (gcpEmail: string | undefined) => {
  return (
    gcpEmail !== undefined &&
    gcpEmail.length <= 253 &&
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/i.test(gcpEmail)
  );
};

export const isGcpDomainValid = (gcpDomain: string | undefined) => {
  return (
    gcpDomain !== undefined &&
    gcpDomain.length <= 253 &&
    // Validate domain: labels must start/end with alphanumeric, dashes allowed in middle
    // No leading/trailing dots or dashes, no consecutive dots
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,12}$/i.test(
      gcpDomain,
    )
  );
};

export const isMountpointMinSizeValid = (minSize: string) => {
  return /^\d+$/.test(minSize) && parseInt(minSize) > 0;
};

export const isPartitionNameValid = (name: string) => {
  return /^[a-zA-Z0-9+_.][a-zA-Z0-9+_.-]*$/.test(name);
};

export const isBlueprintNameValid = (blueprintName: string) =>
  blueprintName.length >= 2 &&
  blueprintName.length <= 100 &&
  /\w+/.test(blueprintName);

export const isSnapshotDateValid = (date: Date) => date.getTime() <= Date.now();

export const isSnapshotValid = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && isSnapshotDateValid(date);
};

export const isFileSystemConfigValid = (partitions: FilesystemPartition[]) => {
  const duplicates = getDuplicateMountPoints(partitions);
  return duplicates.length === 0;
};

export const isUserNameValid = (userName: string) => {
  const isLengthValid = userName.length <= 32;
  const isNotNumericOnly = !/^\d+$/.test(userName);
  const isPatternValid = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9_$]$/.test(
    userName,
  );

  return isLengthValid && isNotNumericOnly && isPatternValid;
};

export const isUserGroupValid = (group: string) => {
  // see `man groupadd` for the exact specification
  return (
    group.length >= 2 &&
    group.length <= 32 &&
    /^[a-zA-Z0-9_][a-zA-Z0-9_-]*(\$)?$/.test(group) &&
    /[a-zA-Z]+/.test(group) // contains at least one letter
  );
};

export const isSshKeyValid = (sshKey: string) => {
  // 1. Key types: ssh-rsa, ssh-dss, ssh-ed25519, or ecdsa-sha2-nistp(256|384|521).
  // 2. Base64-encoded key material.
  // 3. Optional comment at the end.
  const isPatternValid =
    /^(ssh-(rsa|dss|ed25519)|ecdsa-sha2-nistp(256|384|521))\s+[A-Za-z0-9+/=]+(\s+\S+)?$/.test(
      sshKey,
    );
  return isPatternValid;
};

export const getDuplicateMountPoints = (
  partitions: FilesystemPartition[] | DiskPartition[],
): string[] => {
  const mountPointSet: Set<string> = new Set();
  const duplicates: string[] = [];
  for (const partition of partitions) {
    if ('mountpoint' in partition && partition.mountpoint) {
      const mountPoint = partition.mountpoint;
      if (mountPointSet.has(mountPoint)) {
        duplicates.push(mountPoint);
      } else {
        mountPointSet.add(mountPoint);
      }
    }
    if ('type' in partition && partition.type === 'lvm') {
      for (const lv of partition.logical_volumes) {
        if ('mountpoint' in lv && lv.mountpoint) {
          const mountPoint = lv.mountpoint;
          if (mountPointSet.has(mountPoint)) {
            duplicates.push(mountPoint);
          } else {
            mountPointSet.add(mountPoint);
          }
        }
      }
    }
  }
  return duplicates;
};

export const getDuplicateNames = (vg: VolumeGroupWithExtendedLV): string[] => {
  const nameSet: Set<string> = new Set();
  const duplicates: string[] = [];

  if (vg.name) {
    nameSet.add(vg.name);
  }

  if (vg.logical_volumes.length < 1) {
    return [];
  }

  for (const lv of vg.logical_volumes) {
    if (!lv.name) {
      continue;
    }

    if (nameSet.has(lv.name)) {
      duplicates.push(lv.name);
    } else {
      nameSet.add(lv.name);
    }
  }

  return duplicates;
};

export const isNtpServerValid = (ntpServer: string) => {
  return /^([a-z0-9-]+)?(([.:/]{1,3}[a-z0-9-]+)){1,}$/.test(ntpServer);
};

export const isHostnameValid = (hostname: string) => {
  return (
    hostname.length < 65 &&
    /^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/.test(
      hostname,
    )
  );
};

export const isKernelNameValid = (kernelName: string) => {
  return (
    kernelName.length < 65 &&
    /^([a-z0-9]|[a-z0-9][a-z0-9-_.+]*)[a-z0-9]$/.test(kernelName) &&
    /[a-zA-Z]+/.test(kernelName) // contains at least one letter
  );
};

export const isKernelArgumentValid = (arg: string) => {
  return /^[a-zA-Z0-9=\-_,."'/:#+]*$/.test(arg);
};

export const isPortValid = (port: string) => {
  return /^(\d{1,5}|[a-z]{1,6})(-\d{1,5})?[:/][a-z]{1,6}$/.test(port);
};

export const isServiceValid = (service: string) => {
  // see `man systemd.unit` for the exact specification
  return (
    service.length <= 256 &&
    /^[a-zA-Z0-9]([a-zA-Z0-9.\-_:@]*[a-zA-Z0-9])?$/.test(service) &&
    !/--/.test(service) && // does not contain more hyphens in a row
    /[a-zA-Z]+/.test(service) // contains at least one letter
  );
};

export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    const isHttpOrHttps = ['http:', 'https:'].includes(parsedUrl.protocol);
    const hostname = parsedUrl.hostname;
    const hasValidDomain =
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*$/.test(hostname);

    return isHttpOrHttps && hasValidDomain;
  } catch {
    return false;
  }
};

export const isValidCA = (ca: string) => {
  if (!ca || typeof ca !== 'string') return false;

  const trimmed = ca.trim();

  const pemPattern =
    /^-----BEGIN CERTIFICATE-----[\r\n]+([\s\S]*?)[\r\n]+-----END CERTIFICATE-----$/;

  if (!pemPattern.test(trimmed)) {
    return false;
  }

  const match = trimmed.match(pemPattern);
  if (!match || !match[1]) {
    return false;
  }

  const base64Content = match[1].replace(/[\r\n\s]/g, '');

  const base64Pattern = /^[A-Za-z0-9+/]+(=*)$/;
  return base64Pattern.test(base64Content) && base64Content.length > 0;
};

export const parseMultipleCertificates = (input: string): string[] => {
  if (!input || typeof input !== 'string') return [];

  const blockPattern =
    /-----BEGIN CERTIFICATE-----[\s\S]*?(?=-----BEGIN CERTIFICATE-----|$)/g;

  const matches = input.match(blockPattern);
  return matches ? matches.map((m) => m.trim()) : [];
};

export const validateMultipleCertificates = (
  input: string,
): {
  certificates: string[];
  validCertificates: string[];
  invalidCertificates: string[];
  errors: string[];
} => {
  const certificates = parseMultipleCertificates(input);
  const validCertificates: string[] = [];
  const invalidCertificates: string[] = [];
  const errors: string[] = [];

  if (certificates.length === 0 && input.trim() !== '') {
    errors.push(
      'No valid certificate format found. Certificates must be in PEM/DER/CER format.',
    );
    return { certificates, validCertificates, invalidCertificates, errors };
  }

  certificates.forEach((cert, index) => {
    if (isValidCA(cert)) {
      validCertificates.push(cert);
    } else {
      invalidCertificates.push(cert);
      errors.push(
        `Certificate ${index + 1} is not valid. Must be in PEM/DER/CER format.`,
      );
    }
  });

  return { certificates, validCertificates, invalidCertificates, errors };
};
