import { z } from 'zod/v4';

export const SSHKeySchema = z.preprocess(
  // we want to ignore empty strings
  (value) => (value === '' ? undefined : value),
  z
    .string()
    // we can do the regex checks incrementally so that we can have clearer error messages
    .regex(
      // 1. Key types: ssh-rsa, ssh-dss, ssh-ed25519, or ecdsa-sha2-nistp(256|384|521).
      /^ssh-(ed25519|rsa|dss|ecdsa)|ecdsa-sha2-nistp(256|384|521)/,
      'SSH key must be one of ssh-rsa, ssh-dss, ssh-ed25519, or ecdsa-sha2-nistp(256|384|521)',
    )
    .regex(
      // 2. Base64-encoded key material.
      // 3. Optional comment at the end.
      /^(ssh-(rsa|dss|ed25519)|ecdsa-sha2-nistp(256|384|521))\s+[A-Za-z0-9+/=]+(\s+\S+)?$/,
      'SSH key data must be base64 encoded',
    )
    .optional(),
);
