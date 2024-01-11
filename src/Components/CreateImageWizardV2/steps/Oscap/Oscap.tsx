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
  selectDistribution,
  selectProfile,
} from '../../../../store/wizardSlice';

/**
 * Component for the user to select the profile to apply to their image.
 * The selected profile will be stored in the `oscap-profile` form state variable.
 * The Component is shown or not depending on the ShowSelector variable.
 */

const ProfileSelector = () => {
  const oscapProfile = useAppSelector((state) => selectProfile(state));
  const release = useAppSelector((state) => selectDistribution(state));
  const dispatch = useAppDispatch();
  const [profileName, setProfileName] = useState<string | undefined>('');
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
      profile: oscapProfile,
    },
    {
      skip: !oscapProfile,
    }
  );

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
    setProfileName(undefined);
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: DistributionProfileItem
  ) => {
    dispatch(changeOscapProfile(selection));
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
  const release = useAppSelector((state) => selectDistribution(state));
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

/**
 * Component to prompt the use with two choices:
 * - to add a profile, in which case the ProfileSelector will allow the user to
 *   pick a profile to be stored in the `oscap-profile` variable.
 * - to not add a profile, in which case the `oscap-profile` form state goes
 *   undefined.
 */
const AddProfile = () => {
  return (
    <>
      <ProfileSelector />
      <OscapProfileInformation />
    </>
  );
};

export const Oscap = () => {
  return <AddProfile />;
};
