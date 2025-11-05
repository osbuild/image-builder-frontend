import { useCallback, useEffect, useMemo, useState } from 'react';

interface IgnoredWarningsData {
  ignoredWarnings: Record<string, boolean>;
  policyId?: string;
}

export interface UseWarningsManagerArgs {
  blueprintId?: string;
  hasWarnings: boolean;
  currentWarnings?: string[];
  policyId?: string;
  packages?: string[];
}

/**
 * Blueprint warnings manager
 * Tracks ignored compliance warnings and resets when blueprint state changes
 */
export const useWarningsManager = ({
  blueprintId,
  hasWarnings,
  currentWarnings = [],
  policyId,
  packages = [],
}: UseWarningsManagerArgs) => {
  const [ignoredWarnings, setIgnoredWarnings] = useState<
    Record<string, boolean>
  >({});

  const storageKey = blueprintId ? `ignored-warnings-${blueprintId}` : null;

  const canUseStorage = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__ib_ls_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }, []);

  const updateStoredData = useCallback(
    (warnings: Record<string, boolean>, newPolicyId?: string) => {
      if (!storageKey || !canUseStorage) return;
      const data: IgnoredWarningsData = {
        ignoredWarnings: warnings,
        ...(newPolicyId && { policyId: newPolicyId }),
      };
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    },
    [storageKey, canUseStorage],
  );

  // Load ignored warnings
  useEffect(() => {
    if (!storageKey || !canUseStorage) {
      setIgnoredWarnings({});
      return;
    }

    const raw = window.localStorage.getItem(storageKey);
    const data: IgnoredWarningsData | null = raw ? JSON.parse(raw) : null;

    // Reset on missing data or policy change
    if (!data || (policyId && data.policyId !== policyId)) {
      setIgnoredWarnings({});
      updateStoredData({}, policyId);
      return;
    }

    // Cleanup: drop ignored entries that are no longer relevant (package now present)
    const parsePkgFromMessage = (msg: string): string | undefined => {
      const match = msg.match(
        /(?:package\s+)?([\w.+-]+)\s+required\s+by\s+policy\s+is\s+not\s+present/i,
      );
      return match ? match[1] : undefined;
    };

    const cleaned: Record<string, boolean> = {};
    for (const key of Object.keys(data.ignoredWarnings ?? {})) {
      const pkg = parsePkgFromMessage(key);
      if (!pkg || !packages.includes(pkg)) {
        cleaned[key] = true;
      }
    }

    setIgnoredWarnings(cleaned);
    if (
      Object.keys(cleaned).length !==
      Object.keys(data.ignoredWarnings ?? {}).length
    ) {
      updateStoredData(cleaned, policyId);
    }
  }, [storageKey, policyId, packages, updateStoredData, canUseStorage]);

  const ignoreWarnings = () => {
    if (currentWarnings.length === 0) return;

    const newIgnored = { ...ignoredWarnings };
    currentWarnings.forEach((w) => (newIgnored[w] = true));
    setIgnoredWarnings(newIgnored);
    updateStoredData(newIgnored, policyId);
  };

  const shouldShowWarnings =
    hasWarnings && currentWarnings.some((w) => !ignoredWarnings[w]);

  return { shouldShowWarnings, ignoreWarnings, ignoredWarnings };
};
