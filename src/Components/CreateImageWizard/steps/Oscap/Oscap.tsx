import React, { useState } from 'react';

import {
  Alert,
  FormGroup,
  Popover,
  TextContent,
  Text,
  Button,
} from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { HelpIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import OscapProfileInformation from './OscapProfileInformation';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  DistributionProfileItem,
  Filesystem,
  OpenScapProfile,
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
  useLazyGetOscapCustomizationsQuery,
  Services,
} from '../../../../store/imageBuilderApi';
import {
  changeOscapProfile,
  selectDistribution,
  selectProfile,
  addPackage,
  addPartition,
  changeFileSystemConfigurationType,
  removePackage,
  clearPartitions,
  selectImageTypes,
  changeEnabledServices,
  changeMaskedServices,
  changeDisabledServices,
  changeKernelAppend,
} from '../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../utilities/hasSpecificTargetOnly';
import { parseSizeUnit } from '../../utilities/parseSizeUnit';
import { Partition, Units } from '../FileSystem/FileSystemConfiguration';

const ProfileSelector = () => {
  const oscapProfile = useAppSelector(selectProfile);
  const release = useAppSelector(selectDistribution);
  const hasWslTargetOnly = useHasSpecificTargetOnly('wsl');
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
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
      profile: oscapProfile,
    },
    { skip: !oscapProfile }
  );

  const [trigger] = useLazyGetOscapCustomizationsQuery();

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    dispatch(changeOscapProfile(undefined));
    clearOscapPackages(currentProfileData?.packages || []);
    dispatch(changeFileSystemConfigurationType('automatic'));
    handleServices(undefined);
    dispatch(changeKernelAppend(''));
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

    if (newPartitions) {
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

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: OScapSelectOptionValueType
  ) => {
    if (selection.id === undefined) {
      // handle user has selected 'None' case
      handleClear();
    } else {
      const oldOscapPackages = currentProfileData?.packages || [];
      trigger(
        {
          distribution: release,
          profile: selection.id,
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
          dispatch(changeKernelAppend(response.kernel?.append || ''));
          dispatch(changeOscapProfile(selection.id));
        });
    }
    setIsOpen(false);
  };

  const options = () => {
    if (profiles) {
      return [<OScapNoneOption key="oscap-none-option" />].concat(
        profiles.map((profile_id, index) => {
          return <OScapSelectOption key={index} profile_id={profile_id} />;
        })
      );
    }
  };

  return (
    <FormGroup
      isRequired={true}
      data-testid="profiles-form-group"
      label={
        <>
          OpenSCAP profile
          <Popover
            maxWidth="30rem"
            bodyContent={
              <TextContent>
                <Text>
                  To run a manual compliance scan in OpenSCAP, download this
                  image.
                </Text>
              </TextContent>
            }
          >
            <Button
              variant="plain"
              aria-label="About OpenSCAP"
              isInline
              className="pf-u-pl-sm pf-u-pt-0 pf-u-pb-0 pf-u-pr-0"
            >
              <HelpIcon />
            </Button>
          </Popover>
        </>
      }
    >
      <Select
        loadingVariant={isFetching ? 'spinner' : undefined}
        ouiaId="profileSelect"
        variant={SelectVariant.typeahead}
        onToggle={handleToggle}
        onSelect={handleSelect}
        onClear={handleClear}
        maxHeight="300px"
        selections={oscapProfile}
        isOpen={isOpen}
        placeholderText="Select a profile"
        typeAheadAriaLabel="Select a profile"
        isDisabled={!isSuccess || hasWslTargetOnly}
        onFilter={(_event, value) => {
          if (profiles) {
            return [<OScapNoneOption key="oscap-none-option" />].concat(
              profiles.map((profile_id, index) => {
                return (
                  <OScapSelectOption
                    key={index}
                    profile_id={profile_id}
                    filter={value}
                  />
                );
              })
            );
          }
        }}
      >
        {options()}
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

const OScapNoneOption = () => {
  return (
    <SelectOption value={{ toString: () => 'None', compareTo: () => false }} />
  );
};

type OScapSelectOptionPropType = {
  profile_id: DistributionProfileItem;
  filter?: string;
};

type OScapSelectOptionValueType = {
  id: DistributionProfileItem;
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
    id,
    toString: () => name || '',
  });

  return (
    <SelectOption
      key={profile_id}
      value={selectObject(profile_id, oscapProfile?.profile_name)}
      description={oscapProfile?.profile_description}
    />
  );
};

export const Oscap = () => {
  const oscapProfile = useAppSelector(selectProfile);
  const environments = useAppSelector(selectImageTypes);

  return (
    <>
      {environments.includes('wsl') && (
        <Alert
          variant="warning"
          isInline
          title="OpenSCAP profiles are not compatible with WSL images."
        />
      )}
      <ProfileSelector />
      <OscapProfileInformation />
      {oscapProfile && (
        <Alert
          variant="info"
          isInline
          isPlain
          title="Additional customizations"
        >
          Selecting an OpenSCAP profile will cause the appropriate packages,
          file system configuration, kernel arguments, and services to be added
          to your image.
        </Alert>
      )}
    </>
  );
};
