import { jwtDecode } from 'jwt-decode';
import { pem, pki } from 'node-forge';
import z from 'zod';

const MILLISECONDS_PER_SECOND = 1000;
const TOKEN_EXPIRY_WARNING_WINDOW_MS = 24 * 60 * 60 * MILLISECONDS_PER_SECOND;

export const decodeCertificateString = (
  certificate: string,
  ctx: z.RefinementCtx,
) => {
  try {
    const blocks = pem.decode(certificate);

    // so we get to the catch block
    if (blocks.length === 0) throw new Error();

    return blocks;
  } catch {
    ctx.addIssue({
      code: 'custom',
      message:
        'No valid certificate format found. Certificates must be PEM-encoded.',
    });
    return [];
  }
};

export const checkPemBlocks = (
  blocks: pem.ObjectPEM[],
  ctx: z.RefinementCtx,
) => {
  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'Certificate') {
      ctx.addIssue({
        code: 'custom',
        message: `Certificate ${index + 1} is not valid. Must use the CERTIFICATE PEM label.`,
        path: [index],
      });
    }
  }
};

export const normalizeCertificates = (
  blocks: pem.ObjectPEM[],
  ctx: z.RefinementCtx,
) => {
  try {
    return blocks.map((block) =>
      pki.certificateToPem(pki.certificateFromPem(pem.encode(block))),
    );
  } catch {
    ctx.addIssue({
      code: 'custom',
      message: 'Invalid X.509 certificate',
    });
    return [];
  }
};

export const checkJwtToken = (token: string, ctx: z.RefinementCtx) => {
  try {
    const match = token.match(/Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)/);
    if (!match) throw new Error();

    const decoded = jwtDecode(match[1]);
    if (decoded.exp === undefined) return;

    const expirationTimeMs = decoded.exp * MILLISECONDS_PER_SECOND;
    if (expirationTimeMs >= Date.now() + TOKEN_EXPIRY_WARNING_WINDOW_MS) return;

    const expirationDate = new Date(expirationTimeMs);
    ctx.addIssue({
      code: 'custom',
      message: `The token is already expired or will expire within 24 hours. Expiration date: ${expirationDate}`,
    });
  } catch {
    ctx.addIssue({
      code: 'custom',
      message: 'Invalid or missing token',
    });
  }
};
