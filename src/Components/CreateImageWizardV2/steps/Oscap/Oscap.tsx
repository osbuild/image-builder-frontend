import React, { useState, useEffect } from 'react';

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

import OscapProfileInformation from './OscapProfileInformation';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  DistributionProfileItem,
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
} from '../../../../store/imageBuilderApi';
import {
  changeOscapProfile,
  selectDistribution,
  selectProfile,
  clearOscapPackages,
  addPackage,
  selectPackages,
  removePackage,
} from '../../../../store/wizardSlice';

const ProfileSelector = () => {
  const oscapProfile = useAppSelector(selectProfile);

  const release = useAppSelector(selectDistribution);
  const packages = useAppSelector(selectPackages);
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

  const { data: oscapData } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if oscapProfile is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: oscapProfile,
    },
    {
      skip: !oscapProfile,
    }
  );
  const profileName = oscapProfile ? oscapData?.openscap?.profile_name : 'None';

  useEffect(() => {
    dispatch(clearOscapPackages());
    for (const pkg in oscapData?.packages) {
      if (
        packages
          .map((pkg) => pkg.name)
          .includes(oscapData?.packages[Number(pkg)])
      ) {
        dispatch(removePackage(oscapData?.packages[Number(pkg)]));
      }
      dispatch(
        addPackage({
          name: oscapData?.packages[Number(pkg)],
          summary: 'Required by chosen OpenSCAP profile',
          repository: 'distro',
          isRequiredByOpenScap: true,
        })
      );
    }
  }, [oscapData?.packages, dispatch]);

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    dispatch(changeOscapProfile(undefined));
    dispatch(clearOscapPackages());
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: OScapSelectOptionValueType
  ) => {
    dispatch(changeOscapProfile(selection.id));
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
