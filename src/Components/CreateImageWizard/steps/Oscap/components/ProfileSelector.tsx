import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';

import {
  DistributionProfileItem,
  DistributionProfileResponse,
  OpenScap,
  OpenScapProfile,
  useBackendPrefetch,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
} from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeFips,
  changeFscMode,
  clearKernelAppend,
  selectComplianceProfileID,
  selectDistribution,
  setOscapProfile,
} from '@/store/slices/wizard';
import { asDistribution } from '@/store/typeGuards';

import { useSelectorHandlers } from './useSelectorHandlers';

import { removeBetaFromRelease } from '../removeBetaFromRelease';

type OScapSelectOptionValueType = {
  profileID?: DistributionProfileItem;
  toString: () => string;
};

type ProfileSelectorProps = {
  isDisabled?: boolean;
  profiles: DistributionProfileResponse | undefined;
  isFetching: boolean;
  isSuccess: boolean;
  refetch: () => void;
};

const ProfileSelector = ({
  isDisabled = false,
  profiles,
  isFetching,
  isSuccess,
  refetch,
}: ProfileSelectorProps) => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const profileID = useAppSelector(selectComplianceProfileID);
  const release = removeBetaFromRelease(
    asDistribution(useAppSelector(selectDistribution)),
  );
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [profileDetails, setProfileDetails] = useState<
    {
      id: DistributionProfileItem;
      name: string | undefined;
    }[]
  >([]);
  const prefetchProfile = useBackendPrefetch('getOscapCustomizations');
  const {
    clearCompliancePackages,
    handleKernelAppend,
    handlePackages,
    handlePartitions,
    handleServices,
  } = useSelectorHandlers();

  const { data: currentProfileData } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if openScapProfile is undefined the query is going to get skipped
      profile: profileID,
    },
    { skip: !profileID },
  );

  const [trigger] = useLazyGetOscapCustomizationsQuery();

  // prefetch the profiles customizations for on-prem
  // and save the results to the cache, since the request
  // is quite slow
  if (isOnPremise) {
    profiles?.forEach((profile) => {
      prefetchProfile({
        distribution: release,
        profile: profile,
      });
    });
  }

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!profiles) return;

      const promises = profiles.map(async (profileID) => {
        const response = await trigger(
          { distribution: release, profile: profileID },
          true,
        ).unwrap();

        const oscap = response.openscap;
        const isProfile = (oscap: OpenScap): oscap is OpenScapProfile =>
          'profile_name' in oscap;

        const profile_name =
          oscap && isProfile(oscap) ? oscap.profile_name : profileID;

        return {
          id: profileID,
          name: profile_name,
        };
      });

      const resolvedProfiles = await Promise.all(promises);
      setProfileDetails(resolvedProfiles);
    };

    fetchProfileDetails();
  }, [profiles, release, trigger]);

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    dispatch(setOscapProfile(undefined));
    clearCompliancePackages(currentProfileData?.packages || []);
    dispatch(changeFscMode('automatic'));
    handleServices(undefined);
    dispatch(clearKernelAppend());
    dispatch(changeFips(false));
  };

  const applyChanges = (selection: OScapSelectOptionValueType) => {
    if (selection.profileID === undefined) {
      handleClear();
    } else {
      setIsApplying(true);
      const oldOscapPackages = currentProfileData?.packages || [];
      trigger(
        {
          distribution: release,
          profile: selection.profileID as DistributionProfileItem,
        },
        true, // preferCacheValue
      )
        .unwrap()
        .then((response) => {
          const oscapPartitions = response.filesystem || [];
          const newOscapPackages = response.packages || [];
          handlePartitions(oscapPartitions);
          handlePackages(
            oldOscapPackages,
            newOscapPackages,
            'Required by chosen OpenSCAP profile',
          );
          handleServices(response.services);
          handleKernelAppend(response.kernel?.append);
          dispatch(setOscapProfile(selection.profileID));
          dispatch(changeFips(response.fips?.enabled || false));
        })
        .finally(() => setIsApplying(false));
    }
  };

  const handleSelect = (
    _event?: React.MouseEvent<Element, MouseEvent>,
    selection?: string | number,
  ) => {
    if (selection === undefined) return;

    applyChanges(selection as unknown as OScapSelectOptionValueType);
    setIsOpen(false);
  };

  const selectedProfileName = profileID
    ? profileDetails.find(({ id }) => id === profileID)?.name || profileID
    : undefined;

  const profileOptions = () => {
    if (isFetching) {
      return [
        <SelectOption key='oscap-loader' value='loader'>
          <Spinner size='lg' />
        </SelectOption>,
      ];
    }

    const res = profileDetails.map(({ id, name }) => (
      <SelectOption
        key={id}
        value={{
          profileID: id,
          toString: () => name,
        }}
        isSelected={profileID === id}
      >
        {name}
      </SelectOption>
    ));
    return res;
  };

  const toggleOpenSCAP = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      data-testid='profileSelect'
      ref={toggleRef}
      isPlaceholder={!selectedProfileName && !isApplying}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled || !isSuccess || isApplying}
      isFullWidth
      style={{ maxWidth: 'none' }}
    >
      {isApplying ? (
        <>
          <Spinner size='sm' /> Applying profile...
        </>
      ) : (
        selectedProfileName || 'Select a profile'
      )}
    </MenuToggle>
  );

  return (
    <FormGroup>
      <Select
        isScrollable
        isOpen={isOpen}
        selected={profileID}
        onSelect={handleSelect}
        onOpenChange={handleToggle}
        toggle={toggleOpenSCAP}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>{profileOptions()}</SelectList>
      </Select>
    </FormGroup>
  );
};

export default ProfileSelector;
