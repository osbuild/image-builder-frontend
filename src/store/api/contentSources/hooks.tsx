import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectArchitecture,
  selectDistribution,
  selectIsOnPremise,
  selectLocaleLangpackCandidates,
  setVerifiedLocaleLangpacks,
} from '@/store/slices';

import { contentSourcesApi as hostedApi } from './hosted';
import { contentSourcesApi as onPremApi } from './onprem';

const extractPackageNames = (data: { package_name?: string }[]): string[] =>
  Array.from(
    new Set(data.flatMap((d) => (d.package_name ? [d.package_name] : []))),
  );

export const useSearchLanguagePacks = (distroUrls: string[]) => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const dispatch = useAppDispatch();
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const candidateLangpacks = useAppSelector(selectLocaleLangpackCandidates);

  // `isOnPremise` is derived from `selectIsOnPremise`, which reads a
  // build-time constant set by webpack. It will never change between
  // renders, so this conditional does not violate the Rules of Hooks —
  // the same branch is always taken for the lifetime of the application.
  // We also access `.endpoints` directly to avoid circular dependencies.
  const { endpoints } = isOnPremise ? onPremApi : hostedApi;
  const [searchRpms, { isLoading: isSearchLoading }] =
    endpoints.searchRpm.useMutation();

  useEffect(() => {
    if (candidateLangpacks.length === 0) {
      dispatch(setVerifiedLocaleLangpacks([]));
      return;
    }
    if (!isOnPremise && distroUrls.length === 0) {
      return;
    }

    let cancelled = false;
    const run = async () => {
      const request = isOnPremise
        ? {
            packages: candidateLangpacks,
            architecture: arch,
            distribution: distribution,
          }
        : { exact_names: candidateLangpacks, urls: distroUrls, limit: 500 };

      try {
        const data = await searchRpms({
          apiContentUnitSearchRequest: request,
        }).unwrap();
        const verified = extractPackageNames(
          data as { package_name?: string }[],
        );
        if (!cancelled) dispatch(setVerifiedLocaleLangpacks(verified));
      } catch {
        if (!cancelled) dispatch(setVerifiedLocaleLangpacks([]));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    arch,
    distribution,
    distroUrls,
    dispatch,
    isOnPremise,
    candidateLangpacks,
    searchRpms,
  ]);

  return { isLoading: isSearchLoading };
};
