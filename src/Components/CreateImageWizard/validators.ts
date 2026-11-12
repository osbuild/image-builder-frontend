import { jwtDecode } from 'jwt-decode';

export const validateSatelliteCommand = (
  command: string | undefined,
  currentTimeSeconds: number,
): { command?: string; expired?: string } => {
  const commandTrimmed = typeof command === 'string' ? command.trim() : '';

  if (!commandTrimmed) {
    return { command: 'No registration command for Satellite registration' };
  }

  const bearerJwtRegex = /Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)/;
  const match = commandTrimmed.match(bearerJwtRegex);
  if (!match) {
    return { command: 'Invalid or missing token' };
  }

  try {
    const decoded = jwtDecode(match[1]);
    if (decoded.exp && decoded.exp < currentTimeSeconds + 86400) {
      const expirationDate = new Date(decoded.exp * 1000);
      return {
        expired:
          'The token is already expired or will expire by next day. Expiration date: ' +
          expirationDate,
      };
    }
  } catch {
    return { command: 'Invalid or missing token' };
  }

  return {};
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
