import { useEffect, useState } from 'react';

/**
 * Blueprint warnings manager (current simple variant)
 * Stores a blueprint-level ignore flag in localStorage
 */
export const useWarningsManager = (
  blueprintId: string | undefined,
  hasWarnings: boolean,
) => {
  const [isIgnored, setIsIgnored] = useState(false);

  const storageKey = blueprintId ? `ignored-warnings-${blueprintId}` : null;

  // Check if warnings are ignored on load
  useEffect(() => {
    if (storageKey) {
      const ignored = window.localStorage.getItem(storageKey) === 'true';
      setIsIgnored(ignored);
    } else {
      setIsIgnored(false);
    }
  }, [storageKey]);

  const ignoreWarnings = () => {
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, 'true');
      } catch {
        // noop: storage may be unavailable in some environments
      }
      setIsIgnored(true);
    }
  };

  const shouldShowWarnings = hasWarnings && !isIgnored;

  return {
    shouldShowWarnings,
    ignoreWarnings,
  };
};
