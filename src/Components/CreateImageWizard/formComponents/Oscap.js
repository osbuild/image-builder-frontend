import React, { useState } from 'react';

import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Alert, Radio, FormGroup, Spinner } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import PropTypes from 'prop-types';

import { useGetOscapProfilesQuery } from '../../../store/imageBuilderApi';
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
const ProfileSelector = ({ input, showSelector }) => {
  const { change, getState } = useFormApi();
  const [profile, selectProfile] = useState(
    getState()?.values?.['oscap-profile']
  );
  const [isOpen, setIsOpen] = useState(false);

  const { data, isFetching, isSuccess, isError, refetch } =
    useGetOscapProfilesQuery(
      {
        distribution: getState()?.values?.['release'],
      },
      {
        skip: !showSelector,
      }
    );

  if (!showSelector) {
    return undefined;
  }

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    selectProfile(undefined);
    change(input.name, undefined);
    reinitDependingSteps(change);
  };

  const setProfile = (_, selection) => {
    selectProfile(selection);
    setIsOpen(false);
    change(input.name, selection);
    reinitDependingSteps(change);
    change('file-system-config-radio', 'manual');
  };

  return (
    <FormGroup
      isRequired={true}
      label={'Profile to use for this image'}
      data-testid="profiles-form-group"
    >
      <Select
        ouiaId="profileSelect"
        variant={SelectVariant.typeahead}
        onToggle={handleToggle}
        onSelect={setProfile}
        onClear={handleClear}
        selections={profile}
        isOpen={isOpen}
        placeholderText="Select a profile"
        typeAheadAriaLabel="Select a profile"
        isDisabled={!isSuccess}
      >
        {isSuccess &&
          data.map((key, index) => <SelectOption key={index} value={key} />)}
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
  const { change, getState } = useFormApi();
  const oscapProfile = getState()?.values?.['oscap-profile'];
  const [wantsProfile, setWantsProfile] = useState(oscapProfile !== undefined);
  return (
    <>
      <FormGroup label="Compliance profile">
        <Radio
          name="add-a-profile"
          className="pf-u-mt-md"
          data-testid="add-a-profile-radio"
          id="add-a-profile"
          label="Add a profile"
          isChecked={wantsProfile}
          onChange={() => {
            setWantsProfile(true);
            reinitDependingSteps(change);
          }}
        />
        <Radio
          name="dont-add-a-profile"
          className="pf-u-mt-md"
          data-testid="dont-add-a-profile-radio"
          id="dont-add-a-profile"
          label="Do not add a profile"
          isChecked={!wantsProfile}
          onChange={() => {
            setWantsProfile(false);
            change(input.name, undefined);
            reinitDependingSteps(change);
          }}
        />
      </FormGroup>
      <ProfileSelector input={input} showSelector={wantsProfile} />
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
