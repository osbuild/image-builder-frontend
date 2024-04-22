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

import {
  useAppDispatch,
  useAppSelector,
  useServerStore,
} from '../../../../store/hooks';
import {
  DistributionProfileItem,
  Filesystem,
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
  useLazyGetOscapCustomizationsQuery,
} from '../../../../store/imageBuilderApi';
import {
  changeOscapProfile,
  selectDistribution,
  selectProfile,
  addPackage,
  addPartition,
  changeFileSystemPartitionMode,
  removePackage,
  clearPartitions,
} from '../../../../store/wizardSlice';
import { Partition } from '../FileSystem/FileSystemConfiguration';

const ProfileSelector = () => {
  const oscapProfile = useAppSelector(selectProfile);
  const oscapData = useServerStore();
  const release = useAppSelector(selectDistribution);
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

  const profileName = oscapProfile ? oscapData.profileName : 'None';

  const [trigger] = useLazyGetOscapCustomizationsQuery();

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    dispatch(changeOscapProfile(undefined));
    clearOscapPackages(oscapData.packages || []);
    dispatch(changeFileSystemPartitionMode('automatic'));
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
      const partition: Partition = {
        mountpoint: filesystem.mountpoint,
        min_size: filesystem.min_size.toString(),
        unit: 'GiB',
        id: uuidv4(),
      };
      return partition;
    });

    if (newPartitions) {
      dispatch(changeFileSystemPartitionMode('manual'));
      for (const partition of newPartitions) {
        dispatch(addPartition(partition));
      }
    }
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: OScapSelectOptionValueType
  ) => {
    if (selection.id === undefined) {
      // handle user has selected 'None' case
      handleClear();
    } else {
      const oldOscapPackages = oscapData.packages || [];
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
            position="left"
            bodyContent={
              <TextContent>
                <Text>
                  To run a manual compliance scan in OpenSCAP, download this
                  image.
                </Text>
              </TextContent>
            }
          >
            <Button variant="plain" aria-label="About OpenSCAP" isInline>
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
        selections={profileName}
        isOpen={isOpen}
        placeholderText="Select a profile"
        typeAheadAriaLabel="Select a profile"
        isDisabled={!isSuccess}
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
  if (
    filter &&
    !data?.openscap?.profile_name?.toLowerCase().includes(filter.toLowerCase())
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
      value={selectObject(profile_id, data?.openscap?.profile_name)}
      description={data?.openscap?.profile_description}
    />
  );
};

export const Oscap = () => {
  const oscapProfile = useAppSelector(selectProfile);

  return (
    <>
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
