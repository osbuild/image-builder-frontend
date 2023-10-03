import React, { useState } from 'react';

import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Alert,
  Radio,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
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
 * Component for the user to select the policy to apply to their image.
 * The selected policy will be stored in the `oscap-policy` form state variable.
 * The Component is shown or not depending on the ShowSelector variable.
 */
const PolicySelector = ({ input, showSelector }) => {
  const { change, getState } = useFormApi();
  const [policy, selectPolicy] = useState(getState()?.values?.['oscap-policy']);
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
    selectPolicy(undefined);
    change(input.name, undefined);
    reinitDependingSteps(change);
  };

  const setPolicy = (_, selection) => {
    selectPolicy(selection);
    setIsOpen(false);
    change(input.name, selection);
    reinitDependingSteps(change);
    change('file-system-config-radio', 'manual');
  };

  return (
    <FormGroup
      isRequired={true}
      label={'Policy to use for this image'}
      data-testid="policies-form-group"
    >
      <Select
        ouiaId="policySelect"
        variant={SelectVariant.typeahead}
        onToggle={handleToggle}
        onSelect={setPolicy}
        onClear={handleClear}
        selections={policy}
        isOpen={isOpen}
        placeholderText="Select a policy"
        typeAheadAriaLabel="Select a policy"
        isDisabled={!isSuccess}
      >
        {isSuccess &&
          data.map((key, index) => <SelectOption key={index} value={key} />)}
        {isFetching && (
          <SelectOption isNoResultsOption={true} data-testid="policies-loading">
            <Spinner isSVG size="md" />
          </SelectOption>
        )}
      </Select>
      {isError && (
        <Alert
          title="Error fetching the policies"
          variant="danger"
          isPlain
          isInline
        >
          Cannot get the list of policies
        </Alert>
      )}
    </FormGroup>
  );
};

PolicySelector.propTypes = {
  input: PropTypes.any,
  showSelector: PropTypes.bool,
};

/**
 * Component to prompt the use with two choices:
 * - to add a policy, in which case the PolicySelector will allow the user to
 *   pick a policy to be stored in the `oscap-policy` variable.
 * - to not add a policy, in which case the `oscap-policy` form state goes
 *   undefined.
 */
const AddPolicy = ({ input }) => {
  const { change, getState } = useFormApi();
  const oscapPolicy = getState()?.values?.['oscap-policy'];
  const [wantsPolicy, setWantsPolicy] = useState(oscapPolicy !== undefined);
  return (
    <>
      <FormGroup label="Compliance policy">
        <Radio
          name="add-a-policy"
          className="pf-u-mt-md"
          data-testid="add-a-policy-radio"
          id="add-a-policy"
          label="Add a policy"
          isChecked={wantsPolicy}
          onChange={() => {
            setWantsPolicy(true);
            reinitDependingSteps(change);
          }}
        />
        <Radio
          name="dont-add-a-policy"
          className="pf-u-mt-md"
          data-testid="dont-add-a-policy-radio"
          id="dont-add-a-policy"
          label="Do not add a policy"
          isChecked={!wantsPolicy}
          onChange={() => {
            setWantsPolicy(false);
            change(input.name, undefined);
            reinitDependingSteps(change);
          }}
        />
      </FormGroup>
      <PolicySelector input={input} showSelector={wantsPolicy} />
    </>
  );
};

AddPolicy.propTypes = {
  input: PropTypes.object,
};

export const Oscap = ({ ...props }) => {
  const { input } = useFieldApi(props);
  return <AddPolicy input={input} />;
};
