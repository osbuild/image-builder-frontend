import { useMemo } from 'react';

import { useAppSelector } from '@/store/hooks';
import {
  selectCompliancePolicyID,
  selectCompliancePolicyTitle,
  selectComplianceProfileID,
  selectComplianceType,
  selectDistribution,
  selectIsImageMode,
  selectIsOnPremise,
} from '@/store/slices';

import {
  Distributions,
  imageBuilderApi,
  OpenScapProfile,
} from './hosted/imageBuilderApi';
import { composerApi } from './onprem/composerApi';

export const useSecuritySummary = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const complianceType = useAppSelector(selectComplianceType);
  const profileId = useAppSelector(selectComplianceProfileID);
  const policyId = useAppSelector(selectCompliancePolicyID);
  const policyTitle = useAppSelector(selectCompliancePolicyTitle);
  const distribution = useAppSelector(selectDistribution);
  const isImageMode = useAppSelector(selectIsImageMode);

  // `isOnPremise` is derived from `process.env.IS_ON_PREMISE`, which is
  // a build-time constant set by webpack. It will never change between
  // renders, so this conditional does not violate the Rules of Hooks —
  // the same branch is always taken for the lifetime of the application.
  // We also access `.endpoints` directly to avoid circular dependencies.
  const { endpoints } = isOnPremise ? composerApi : imageBuilderApi;
  const { data: oscapData } = endpoints.getOscapCustomizations.useQuery(
    {
      // @ts-expect-error we skip this if it's not defined
      profile: profileId,
      distribution: distribution as Distributions,
    },
    { skip: isImageMode || !profileId },
  );

  const { data: complianceData } =
    imageBuilderApi.endpoints.getOscapCustomizationsForPolicy.useQuery(
      {
        // @ts-expect-error we skip this if it's not defined
        policy: policyId,
        distribution: distribution as Distributions,
      },
      {
        skip: isImageMode || isOnPremise || !policyId,
      },
    );

  const data = complianceType === 'compliance' ? complianceData : oscapData;

  // sanitising the services first just makes everything a little
  // easier in the next step, since we also want the total count
  const { enabled, disabled, masked } = useMemo(
    () => ({
      enabled: data?.services?.enabled ?? [],
      disabled: data?.services?.disabled ?? [],
      masked: data?.services?.masked ?? [],
    }),
    [data?.services],
  );

  const title = useMemo(() => {
    if (complianceType === 'compliance') {
      return policyTitle;
    }

    const profile = data?.openscap as OpenScapProfile | undefined;
    return profile?.profile_name ?? profileId;
  }, [data?.openscap, complianceType, policyTitle, profileId]);

  const fipsRequired = useMemo(
    () => data?.fips?.enabled ?? false,
    [data?.fips?.enabled],
  );

  return useMemo(
    () => ({
      title,
      fipsRequired,
      packages: data?.packages ?? [],
      services: {
        enabled,
        disabled,
        masked,
        total: enabled.length + disabled.length + masked.length,
      },
      kernel: {
        append: data?.kernel?.append?.split(' ').filter(Boolean) ?? [],
      },
    }),
    [data, title, fipsRequired, enabled, disabled, masked],
  );
};
