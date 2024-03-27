import React, { useEffect, useState } from 'react';

import {
  Alert,
  FormGroup,
  Spinner,
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
  changeKernel,
  selectDistribution,
  selectProfile,
  selectKernel,
  selectDisabledServices,
  selectEnabledServices,
  changeDisabledServices,
  changeEnabledServices,
} from '../../../../store/wizardSlice';

const ProfileSelector = () => {
  const oscapProfile = useAppSelector(selectProfile);
  let kernel = useAppSelector(selectKernel);
  let disabledServices = useAppSelector(selectDisabledServices);
  let enabledServices = useAppSelector(selectEnabledServices);
  const release = useAppSelector(selectDistribution);
  const dispatch = useAppDispatch();
  const [profileName, setProfileName] = useState<string | undefined>('None');
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

  const { data } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if oscapProfile is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: oscapProfile,
    },
    {
      skip: !oscapProfile,
    }
  );
  kernel = data?.kernel?.append;
  disabledServices = data?.services?.disabled;
  enabledServices = data?.services?.enabled;

  useEffect(() => {
    if (isFetching || !isSuccess) return;
    dispatch(changeKernel(kernel));
    dispatch(changeDisabledServices(disabledServices));
    dispatch(changeEnabledServices(enabledServices));
  }, [
    isFetching,
    isSuccess,
    dispatch,
    data?.kernel?.append,
    data?.services?.disabled,
    data?.services?.enabled,
    disabledServices,
    enabledServices,
    kernel,
  ]);

  useEffect(() => {
    if (
      data &&
      data.openscap &&
      typeof data.openscap.profile_name === 'string'
    ) {
      setProfileName(data.openscap.profile_name);
    }
  }, [data]);

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    dispatch(changeOscapProfile(undefined));
    dispatch(changeKernel(undefined));
    dispatch(changeDisabledServices(undefined));
    dispatch(changeEnabledServices(undefined));
    setProfileName(undefined);
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: DistributionProfileItem
  ) => {
    dispatch(changeOscapProfile(selection));
    dispatch(changeKernel(kernel));
    dispatch(changeDisabledServices(disabledServices));
    dispatch(changeEnabledServices(enabledServices));
    setIsOpen(false);
  };

  const options = [
    <OScapNoneOption setProfileName={setProfileName} key="oscap-none-option" />,
  ];
  if (isSuccess) {
    options.concat(
      profiles.map((profile_id) => {
        return (
          <OScapSelectOption
            key={profile_id}
            profile_id={profile_id}
            setProfileName={setProfileName}
          />
        );
      })
    );
  }

  if (isFetching) {
    options.push(
      <SelectOption
        isNoResultsOption={true}
        data-testid="policies-loading"
        key={'None'}
      >
        <Spinner size="md" />
      </SelectOption>
    );
  }

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
        ouiaId="profileSelect"
        variant={SelectVariant.typeahead}
        onToggle={handleToggle}
        onSelect={handleSelect}
        onClear={handleClear}
        selections={profileName}
        isOpen={isOpen}
        placeholderText="Select a profile"
        typeAheadAriaLabel="Select a profile"
        isDisabled={!isSuccess}
        onFilter={(_event, value) => {
          if (profiles) {
            return [
              <OScapNoneOption
                setProfileName={setProfileName}
                key="oscap-none-option"
              />,
            ].concat(
              profiles.map((profile_id, index) => {
                return (
                  <OScapSelectOption
                    key={index}
                    profile_id={profile_id}
                    setProfileName={setProfileName}
                    input={value}
                  />
                );
              })
            );
          }
        }}
      >
        {options}
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

type OScapNoneOptionPropType = {
  setProfileName: (name: string) => void;
};

const OScapNoneOption = ({ setProfileName }: OScapNoneOptionPropType) => {
  return (
    <SelectOption
      value={undefined}
      onClick={() => {
        setProfileName('None');
      }}
    >
      <p>{'None'}</p>
    </SelectOption>
  );
};

type OScapSelectOptionPropType = {
  profile_id: DistributionProfileItem;
  setProfileName: (name: string) => void;
  input?: string;
};

const OScapSelectOption = ({
  profile_id,
  setProfileName,
  input,
}: OScapSelectOptionPropType) => {
  const release = useAppSelector(selectDistribution);
  const { data } = useGetOscapCustomizationsQuery({
    distribution: release,
    profile: profile_id,
  });

  if (
    input &&
    !data?.openscap?.profile_name?.toLowerCase().includes(input.toLowerCase())
  ) {
    return null;
  }

  return (
    <SelectOption
      key={profile_id}
      value={profile_id}
      onClick={() => {
        if (data?.openscap?.profile_name) {
          setProfileName(data?.openscap?.profile_name);
        }
      }}
    >
      <p>{data?.openscap?.profile_name}</p>
    </SelectOption>
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
