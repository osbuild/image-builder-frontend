import React, { useEffect, useState } from 'react';

import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
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
import PropTypes from 'prop-types';

import OscapProfileInformation from './OscapProfileInformation';

import {
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
} from '../../../store/imageBuilderApi';
import { reinitFileSystemConfiguratioStep } from '../steps/fileSystemConfiguration';
import { reinitPackagesStep } from '../steps/packages';

/**
 * Every time there is change on this form step's state, reinitialise the steps
 * that are depending on it. This will ensure that if the user goes back and
 * change their mind, going forward again leaves them in a coherent and workable
 * form state.
 */
const reinitDependingSteps = (change) => {
  reinitFileSystemConfiguratioStep(change);
  reinitPackagesStep(change);
};

/**
 * Component for the user to select the profile to apply to their image.
 * The selected profile will be stored in the `oscap-profile` form state variable.
 * The Component is shown or not depending on the ShowSelector variable.
 */
const ProfileSelector = ({ input }) => {
  const { change, getState } = useFormApi();
  const [profile, setProfile] = useState(getState()?.values?.['oscap-profile']);
  const [profileName, setProfileName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: profiles,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useGetOscapProfilesQuery({
    distribution: getState()?.values?.['release'],
  });

  const { data } = useGetOscapCustomizationsQuery(
    {
      distribution: getState()?.values?.['release'],
      profile: profile,
    },
    {
      skip: !profile,
    }
  );
  useEffect(() => {
    if (data) {
      setProfileName(data?.openscap?.profile_name);
    }
  }, [data]);

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    setProfile(undefined);
    change(input.name, undefined);
    setProfileName(undefined);
    reinitDependingSteps(change);
  };

  const handleSelect = (_, selection) => {
    setProfile(selection);
    setIsOpen(false);
    change(input.name, selection);
    reinitDependingSteps(change);
    change('file-system-config-radio', 'manual');
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
          return [
            <OScapNoneOption setProfileName={setProfileName} key={profiles} />,
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
        }}
      >
        {isSuccess &&
          [
            <OScapNoneOption setProfileName={setProfileName} key={profiles} />,
          ].concat(
            profiles.map((profile_id) => {
              return (
                <OScapSelectOption
                  key={profile_id}
                  profile_id={profile_id}
                  setProfileName={setProfileName}
                />
              );
            })
          )}

        {isFetching && (
          <SelectOption isNoResultsOption={true} data-testid="policies-loading">
            <Spinner size="md" />
          </SelectOption>
        )}
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

const OScapNoneOption = ({ setProfileName }) => {
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

OScapNoneOption.propTypes = {
  setProfileName: PropTypes.any,
};

const OScapSelectOption = ({ profile_id, setProfileName, input }) => {
  const { getState } = useFormApi();
  const { data } = useGetOscapCustomizationsQuery({
    distribution: getState()?.values?.['release'],
    profile: profile_id,
  });
  if (
    input &&
    !data?.openscap?.profile_name.toLowerCase().includes(input.toLowerCase())
  ) {
    return null;
  }

  return (
    <SelectOption
      key={profile_id}
      value={profile_id}
      onClick={() => {
        setProfileName(data?.openscap?.profile_name);
      }}
    >
      <p>{data?.openscap?.profile_name}</p>
    </SelectOption>
  );
};

OScapSelectOption.propTypes = {
  profile_id: PropTypes.string,
  setProfileName: PropTypes.any,
  input: PropTypes.string,
};

ProfileSelector.propTypes = {
  input: PropTypes.any,
  showSelector: PropTypes.bool,
};

/**
 * Component to prompt the use with two choices:
 * - to add a profile, in which case the ProfileSelector will allow the user to
 *   pick a profile to be stored in the `oscap-profile` variable.
 * - to not add a profile, in which case the `oscap-profile` form state goes
 *   undefined.
 */
const AddProfile = ({ input }) => {
  return (
    <>
      <ProfileSelector input={input} />
      <OscapProfileInformation />
    </>
  );
};

AddProfile.propTypes = {
  input: PropTypes.object,
};

export const Oscap = ({ ...props }) => {
  const { input } = useFieldApi(props);
  return <AddProfile input={input} />;
};
