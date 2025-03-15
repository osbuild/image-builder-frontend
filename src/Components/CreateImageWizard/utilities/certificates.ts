export const isValidPEM = (cert: string): boolean => {
  return /-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----/.test(
    cert.trim()
  );
};
