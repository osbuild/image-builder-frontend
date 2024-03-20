import React, { useEffect, useState } from 'react';

import useFieldApi, {
  UseFieldApiConfig,
} from '@data-driven-forms/react-form-renderer/use-field-api';
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

import OscapProfileInformation from './OscapProfileInformation';

import {
  DistributionProfileItem,
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
} from '../../../store/imageBuilderApi';
import { reinitFileSystemConfiguratioStep } from '../steps/fileSystemConfiguration';
import { reinitPackagesStep } from '../steps/packages';

type ChangeType = <F extends keyof Record<string, string | undefined>>(
  name: F,
  value?: Record<string, string | undefined>[F]
) => void;

/**
 * Every time there is change on this form step's state, reinitialise the steps
 * that are depending on it. This will ensure that if the user goes back and
 * change their mind, going forward again leaves them in a coherent and workable
 * form state.
 */
const reinitDependingSteps = (change: ChangeType) => {
  reinitFileSystemConfiguratioStep(change);
  reinitPackagesStep(change);
};
type ProfileSelectorProps = {
  input: { name: string };
};
/**
 * Component for the user to select the profile to apply to their image.
 * The selected profile will be stored in the `oscap-profile` form state variable.
 * The Component is shown or not depending on the ShowSelector variable.
 */

const ProfileSelector = ({ input }: ProfileSelectorProps) => {
  const { change, getState } = useFormApi();
  const [profileName, setProfileName] = useState<string>('None');
  const [profile, setProfile] = useState(getState()?.values?.['oscap-profile']);
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
    if (
      data &&
      data.openscap &&
      typeof data.openscap.profile_name === 'string'
    ) {
      setProfileName(data.openscap.profile_name);
    }
    if (data?.kernel) {
      change('kernel', data.kernel);
    }
    if (data?.services?.enabled) {
      change('enabledServices', data.services.enabled);
    }
    if (data?.services?.masked) {
      change('maskedServices', data.services.masked);
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
    change('kernel', undefined);
    change('enabledServices', undefined);
    change('maskedServices', undefined);
    setProfileName('');
    reinitDependingSteps(change);
  };

  const handleSelect = (_: React.MouseEvent, selection: string) => {
    setProfile(selection);
    setIsOpen(false);
    change(input.name, selection);
    reinitDependingSteps(change);
    change('file-system-config-radio', 'manual');
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
  const { getState } = useFormApi();
  const { data } = useGetOscapCustomizationsQuery({
    distribution: getState()?.values?.['release'],
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
          setProfileName(data.openscap.profile_name);
        }
      }}
    >
      <p>{data?.openscap?.profile_name}</p>
    </SelectOption>
  );
};

type ProfileTypeProp = {
  input: { name: string };
};

/**
 * Component to prompt the use with two choices:
 * - to add a profile, in which case the ProfileSelector will allow the user to
 *   pick a profile to be stored in the `oscap-profile` variable.
 * - to not add a profile, in which case the `oscap-profile` form state goes
 *   undefined.
 */
const AddProfile = ({ input }: ProfileTypeProp) => {
  return (
    <>
      <ProfileSelector input={input} />
      <OscapProfileInformation />
    </>
  );
};

interface OscapProps extends UseFieldApiConfig {}

export const Oscap = (props: OscapProps) => {
  const { input } = useFieldApi(props);
  return <AddProfile input={input} />;
};
