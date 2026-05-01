import { useEffect, useState } from 'react';

import { DEBOUNCED_SEARCH_WAIT_TIME } from '../constants';

const isEqual = <T,>(a: T, b: T): boolean => {
  if (a === b) return true;
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  return JSON.stringify(a) === JSON.stringify(b);
};

function useDebounce<T>(
  value: T,
  delay: number = DEBOUNCED_SEARCH_WAIT_TIME,
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // We need to make sure that we compare-deep here as the default useEffect deps do not.
    if (!isEqual(value, debouncedValue)) {
      const timer = setTimeout(
        () => setDebouncedValue(value),
        value === '' ? 0 : delay, //If value is empty string, instantly return
      );

      return () => {
        clearTimeout(timer);
      };
    }
    // Eslint apparrently likes cyclic dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
