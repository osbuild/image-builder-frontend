import React, { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { useSelectorHandlers } from './useSelectorHandlers';

import { useIsOnPremise } from '../../../../../Hooks';
import {
  useBackendPrefetch,
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
  useLazyGetOscapCustomizationsQuery,
} from '../../../../../store/backendApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  DistributionProfileItem,
  OpenScap,
  OpenScapProfile,
} from '../../../../../store/imageBuilderApi';
import { asDistribution } from '../../../../../store/typeGuards';
import {
  changeFips,
  changeFscMode,
  clearKernelAppend,
  selectComplianceProfileID,
  selectComplianceType,
  selectDistribution,
  setOscapProfile,
} from '../../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../../utilities/hasSpecificTargetOnly';
import { removeBetaFromRelease } from '../removeBetaFromRelease';

type OScapSelectOptionValueType = {
  profileID?: DistributionProfileItem;
  toString: () => string;
};

type ProfileSelectorProps = {
  isDisabled?: boolean;
};

const ProfileSelector = ({ isDisabled = false }: ProfileSelectorProps) => {
  const isOnPremise = useIsOnPremise();
  const profileID = useAppSelector(selectComplianceProfileID);
  const release = removeBetaFromRelease(
    asDistribution(useAppSelector(selectDistribution)),
  );
  const hasWslTargetOnly = useHasSpecificTargetOnly('wsl');
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<
    {
      id: DistributionProfileItem;
      name: string | undefined;
    }[]
  >([]);
  const [profileDetails, setProfileDetails] = useState<
    {
      id: DistributionProfileItem;
      name: string | undefined;
    }[]
  >([]);
  const complianceType = useAppSelector(selectComplianceType);
  const prefetchProfile = useBackendPrefetch('getOscapCustomizations');
  const {
    clearCompliancePackages,
    handleKernelAppend,
    handlePackages,
    handlePartitions,
    handleServices,
  } = useSelectorHandlers();

  const {
    data: profiles,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useGetOscapProfilesQuery({
    distribution: release,
  });

  const { data: currentProfileData } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if openScapProfile is undefined the query is going to get skipped
      profile: profileID,
    },
    { skip: !profileID },
  );

  const [trigger] = useLazyGetOscapCustomizationsQuery();

  useEffect(() => {
    if (!profileID) {
      setInputValue('');
      setFilterValue('');
      setIsOpen(false);
    }
  }, [profileID]);

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
      setSelectOptions(resolvedProfiles);
    };

    fetchProfileDetails();
  }, [profiles, release, trigger]);

  useEffect(() => {
    if (!filterValue) {
      setSelectOptions(profileDetails);
      return;
    }
    const trimmedFilter = filterValue.toLowerCase().trim();
    const filtered = profileDetails.filter(({ name }) =>
      name?.toLowerCase().includes(trimmedFilter),
    );

    setSelectOptions(filtered);
    if (!isOpen && filtered.length > 0) {
      setIsOpen(true);
    }
  }, [filterValue, profileDetails, isOpen]);

  const handleToggle = () => {
    if (!isOpen && complianceType === 'openscap') {
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
    setInputValue('');
    setFilterValue('');
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      setIsOpen(false);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setInputValue(value);
    setFilterValue(value);

    if (value !== profileID) {
      dispatch(setOscapProfile(undefined));
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
      } else if (selectOptions.length === 1) {
        const singleProfile = selectOptions[0];
        const selection: OScapSelectOptionValueType = {
          profileID: singleProfile.id,
          toString: () => singleProfile.name || '',
        };

        setInputValue(singleProfile.name || '');
        setFilterValue('');
        applyChanges(selection);
        setIsOpen(false);
      }
    }
  };

  const applyChanges = (selection: OScapSelectOptionValueType) => {
    if (selection.profileID === undefined) {
      // handle user has selected 'None' case
      handleClear();
    } else {
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
        });
    }
  };

  const handleSelect = (
    _event?: React.MouseEvent<Element, MouseEvent>,
    selection?: string | number,
  ) => {
    if (selection === undefined) return;

    setInputValue((selection as OScapSelectOptionValueType['profileID']) || '');
    setFilterValue('');
    applyChanges(selection as unknown as OScapSelectOptionValueType);
    setIsOpen(false);
  };

  const toggleOpenSCAP = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      data-testid='profileSelect'
      ref={toggleRef}
      variant='typeahead'
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled || !isSuccess || hasWslTargetOnly}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={
            profileID
              ? profileDetails.find(({ id }) => id === profileID)?.name ||
                profileID
              : inputValue
          }
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onKeyDown}
          autoComplete='off'
          placeholder='None'
          isExpanded={isOpen}
        />

        {profileID && (
          <TextInputGroupUtilities>
            <Button
              icon={<TimesIcon />}
              variant='plain'
              onClick={handleClear}
              aria-label='Clear input'
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
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
        popperProps={{
          maxWidth: '50vw',
        }}
      >
        <SelectList>
          {isFetching && (
            <SelectOption value='loader'>
              <Spinner size='lg' />
            </SelectOption>
          )}
          {selectOptions.length > 0 &&
            [
              <SelectOption
                key='oscap-none-option'
                value={{ toString: () => 'None', compareTo: () => false }}
                isSelected={!profileID}
              >
                None
              </SelectOption>,
            ].concat(
              selectOptions.map(({ id, name }) => (
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
              )),
            )}
          {isSuccess && selectOptions.length === 0 && (
            <SelectOption isDisabled>
              {`No results found for "${filterValue}"`}
            </SelectOption>
          )}
        </SelectList>
      </Select>
      {isError && (
        <Alert
          title='Error fetching the profiles'
          variant='danger'
          isPlain
          isInline
        >
          Cannot get the list of profiles
        </Alert>
      )}
    </FormGroup>
  );
};

export default ProfileSelector;
