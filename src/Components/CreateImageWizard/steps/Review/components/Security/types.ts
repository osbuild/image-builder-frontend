import { useSecuritySummary } from '@/store/api/backend';

export type SecuritySummary = ReturnType<typeof useSecuritySummary>;

type ConfiguredSecurity = SecuritySummary & { title: string };

export const isSecurityConfigured = (
  security: SecuritySummary | undefined,
): security is ConfiguredSecurity => {
  return !!(security && security.title);
};
