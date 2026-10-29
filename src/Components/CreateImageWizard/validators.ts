export const isAzureTenantGUIDValid = (azureTenantGUID: string | undefined) => {
  return (
    azureTenantGUID !== undefined &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      azureTenantGUID,
    )
  );
};

export const isAzureSubscriptionIdValid = (
  azureSubscriptionId: string | undefined,
) => {
  return (
    azureSubscriptionId !== undefined &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      azureSubscriptionId,
    )
  );
};

export const isAzureResourceGroupValid = (
  azureResourceGroup: string | undefined,
) => {
  return (
    azureResourceGroup !== undefined &&
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

export const isBlueprintNameValid = (blueprintName: string) =>
  blueprintName.length >= 2 &&
  blueprintName.length <= 100 &&
  /\w+/.test(blueprintName);

export const isSnapshotDateValid = (date: Date) => date.getTime() <= Date.now();

export const isSnapshotValid = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && isSnapshotDateValid(date);
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
