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
import { v4 as uuidv4 } from 'uuid';

import { useSelectorHandlers } from './useSelectorHandlers';

import {
  useBackendPrefetch,
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
  useLazyGetOscapCustomizationsQuery,
} from '../../../../../store/backendApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  DistributionProfileItem,
  Filesystem,
  OpenScap,
  OpenScapProfile,
  Services,
} from '../../../../../store/imageBuilderApi';
import {
  addKernelArg,
  addPackage,
  addPartition,
  changeCompliance,
  changeDisabledServices,
  changeEnabledServices,
  changeFileSystemConfigurationType,
  changeMaskedServices,
  clearKernelAppend,
  clearPartitions,
  selectComplianceProfileID,
  selectComplianceType,
  selectDistribution,
} from '../../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../../utilities/hasSpecificTargetOnly';
import { parseSizeUnit } from '../../../utilities/parseSizeUnit';
import { Partition, Units } from '../../FileSystem/components/FileSystemTable';
import { removeBetaFromRelease } from '../removeBetaFromRelease';

type OScapSelectOptionValueType = {
  profileID: DistributionProfileItem;
  toString: () => string;
};

const ProfileSelector = () => {
  const profileID = useAppSelector(selectComplianceProfileID);
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));
  const hasWslTargetOnly = useHasSpecificTargetOnly('wsl');
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<
    {
      id: DistributionProfileItem;
      name: string | undefined;
      description?: string | undefined;
    }[]
  >([]);
  const [profileDetails, setProfileDetails] = useState<
    {
      id: DistributionProfileItem;
      name: string | undefined;
      description?: string | undefined;
    }[]
  >([]);
  const complianceType = useAppSelector(selectComplianceType);
  const prefetchProfile = useBackendPrefetch('getOscapCustomizations');
  const { clearCompliancePackages, handlePackages } = useSelectorHandlers();

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
    { skip: !profileID }
  );

  const [trigger] = useLazyGetOscapCustomizationsQuery();

  // prefetch the profiles customizations for on-prem
  // and save the results to the cache, since the request
  // is quite slow
  if (process.env.IS_ON_PREMISE) {
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
          true
        ).unwrap();

        const oscap = response?.openscap;
        const isProfile = (oscap: OpenScap): oscap is OpenScapProfile =>
          'profile_name' in oscap;

        const profile_name =
          oscap && isProfile(oscap) ? oscap.profile_name : profileID;

        const profile_description =
          oscap && isProfile(oscap) ? oscap.profile_description : '';

        return {
          id: profileID,
          name: profile_name,
          description: profile_description,
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
      name?.toLowerCase().includes(trimmedFilter)
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
    dispatch(
      changeCompliance({
        profileID: undefined,
        policyID: undefined,
        policyTitle: undefined,
      })
    );
    clearCompliancePackages(currentProfileData?.packages || []);
    dispatch(changeFileSystemConfigurationType('automatic'));
    handleServices(undefined);
    dispatch(clearKernelAppend());
    setInputValue('');
    setFilterValue('');
  };

  const handlePartitions = (oscapPartitions: Filesystem[]) => {
    dispatch(clearPartitions());

    const newPartitions = oscapPartitions.map((filesystem) => {
      const [size, unit] = parseSizeUnit(filesystem.min_size);
      const partition: Partition = {
        mountpoint: filesystem.mountpoint,
        min_size: size.toString(),
        unit: unit as Units,
        id: uuidv4(),
      };
      return partition;
    });

    if (newPartitions.length > 0) {
      dispatch(changeFileSystemConfigurationType('manual'));
      for (const partition of newPartitions) {
        dispatch(addPartition(partition));
      }
    }
  };

  const handleServices = (services: Services | undefined) => {
    dispatch(changeEnabledServices(services?.enabled || []));
    dispatch(changeMaskedServices(services?.masked || []));
    dispatch(changeDisabledServices(services?.disabled || []));
  };

  const handleKernelAppend = (kernelAppend: string | undefined) => {
    dispatch(clearKernelAppend());

    if (kernelAppend) {
      const kernelArgsArray = kernelAppend.split(' ');
      for (const arg of kernelArgsArray) {
        dispatch(addKernelArg(arg));
      }
    }
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
      dispatch(
        changeCompliance({
          profileID: undefined,
          policyID: undefined,
          policyTitle: undefined,
        })
      );
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
        true // preferCacheValue
      )
        .unwrap()
        .then((response) => {
          const oscapPartitions = response.filesystem || [];
          const newOscapPackages = response.packages || [];
          handlePartitions(oscapPartitions);
          handlePackages(
            oldOscapPackages,
            newOscapPackages,
            'Required by chosen OpenSCAP profile'
          );
          handleServices(response.services);
          handleKernelAppend(response.kernel?.append);
          dispatch(
            changeCompliance({
              profileID: selection.profileID,
              policyID: undefined,
              policyTitle: undefined,
            })
          );
        });
    }
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: string
  ) => {
    if (selection) {
      setInputValue(selection);
      setFilterValue('');
      applyChanges(selection as unknown as OScapSelectOptionValueType);
      setIsOpen(false);
    }
  };

  const toggleOpenSCAP = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      data-testid="profileSelect"
      ref={toggleRef}
      variant="typeahead"
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={!isSuccess || hasWslTargetOnly}
      style={
        {
          width: '100%',
        } as React.CSSProperties
      }
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={profileID ? profileID : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onKeyDown}
          autoComplete="off"
          placeholder="None"
          isExpanded={isOpen}
        />

        {profileID && (
          <TextInputGroupUtilities>
            <Button
              icon={<TimesIcon />}
              variant="plain"
              onClick={handleClear}
              aria-label="Clear input"
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup label="Profile">
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
            <SelectOption value="loader">
              <Spinner size="lg" />
            </SelectOption>
          )}
          {selectOptions.length > 0 &&
            [
              <SelectOption
                key="oscap-none-option"
                value={{ toString: () => 'None', compareTo: () => false }}
              >
                None
              </SelectOption>,
            ].concat(
              selectOptions.map(({ id, name, description }) => (
                <SelectOption
                  key={id}
                  value={{
                    profileID: id,
                    toString: () => name,
                  }}
                  description={description}
                >
                  {name}
                </SelectOption>
              ))
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
          title="Error fetching the profiles"
          variant="danger"
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
