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

import {
  useGetOscapProfilesQuery,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
  useBackendPrefetch,
} from '../../../../../store/backendApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  DistributionProfileItem,
  Filesystem,
  OpenScapProfile,
  Services,
} from '../../../../../store/imageBuilderApi';
import {
  changeCompliance,
  selectDistribution,
  selectComplianceProfileID,
  addPackage,
  addPartition,
  changeFileSystemConfigurationType,
  removePackage,
  clearPartitions,
  changeEnabledServices,
  changeMaskedServices,
  changeDisabledServices,
  selectComplianceType,
  clearKernelAppend,
  addKernelArg,
} from '../../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../../utilities/hasSpecificTargetOnly';
import { parseSizeUnit } from '../../../utilities/parseSizeUnit';
import { Partition, Units } from '../../FileSystem/FileSystemTable';
import { removeBetaFromRelease } from '../removeBetaFromRelease';

type OScapSelectOptionPropType = {
  profile_id: DistributionProfileItem;
  filter?: string;
};

type OScapSelectOptionValueType = {
  profileID: DistributionProfileItem;
  toString: () => string;
};

const OScapSelectOption = ({
  profile_id,
  filter,
}: OScapSelectOptionPropType) => {
  const release = useAppSelector(selectDistribution);
  const { data } = useGetOscapCustomizationsQuery({
    distribution: release,
    profile: profile_id,
  });
  const oscapProfile = data?.openscap as OpenScapProfile;
  if (
    filter &&
    !oscapProfile?.profile_name?.toLowerCase().includes(filter.toLowerCase())
  ) {
    return null;
  }
  const selectObject = (
    id: DistributionProfileItem,
    name?: string
  ): OScapSelectOptionValueType => ({
    profileID: id,
    toString: () => name || '',
  });

  return (
    <SelectOption
      key={profile_id}
      value={selectObject(profile_id, oscapProfile?.profile_name)}
      description={oscapProfile?.profile_description}
    >
      {oscapProfile?.profile_name}
    </SelectOption>
  );
};

const ProfileSelector = () => {
  const profileID = useAppSelector(selectComplianceProfileID);
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));
  const hasWslTargetOnly = useHasSpecificTargetOnly('wsl');
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<string[]>([]);
  const complianceType = useAppSelector(selectComplianceType);
  const prefetchProfile = useBackendPrefetch('getOscapCustomizations');

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
    let filteredProfiles = profiles;

    if (filterValue) {
      filteredProfiles = profiles?.filter((profile: string) =>
        String(profile).toLowerCase().includes(filterValue.toLowerCase())
      );
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    if (filteredProfiles) {
      setSelectOptions(filteredProfiles);
    }

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, profiles]);

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
    clearOscapPackages(currentProfileData?.packages || []);
    dispatch(changeFileSystemConfigurationType('automatic'));
    handleServices(undefined);
    dispatch(clearKernelAppend());
    setInputValue('');
    setFilterValue('');
  };

  const handlePackages = (
    oldOscapPackages: string[],
    newOscapPackages: string[]
  ) => {
    clearOscapPackages(oldOscapPackages);

    for (const pkg of newOscapPackages) {
      dispatch(
        addPackage({
          name: pkg,
          summary: 'Required by chosen OpenSCAP profile',
          repository: 'distro',
        })
      );
    }
  };

  const clearOscapPackages = (oscapPackages: string[]) => {
    for (const pkg of oscapPackages) {
      dispatch(removePackage(pkg));
    }
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
          handlePackages(oldOscapPackages, newOscapPackages);
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
          value={profileID ? profileID : inputValue || 'None'}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete="off"
          placeholder="Select a profile"
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
              selectOptions.map(
                (name: DistributionProfileItem, index: number) => (
                  <OScapSelectOption key={index} profile_id={name} />
                )
              )
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
