import React, { useEffect, useState } from 'react';

import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Alert,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { useGetActivationKeysQuery } from '../../../store/apiSlice';

const ActivationKeys = ({ label, isRequired, ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [isOpen, setIsOpen] = useState(false);
  const [activationKeySelected, selectActivationKey] = useState(
    getState()?.values?.['subscription-activation-key']
  );

  const {
    data: activationKeys,
    isFetching: isFetchingActivationKeys,
    isSuccess: isSuccessActivationKeys,
    isError: isErrorActivationKeys,
    refetch,
  } = useGetActivationKeysQuery();

  useEffect(() => {
    if (insights.chrome.isProd()) {
      change('subscription-server-url', 'subscription.rhsm.redhat.com');
      change('subscription-base-url', 'https://cdn.redhat.com/');
    } else {
      change('subscription-server-url', 'subscription.rhsm.stage.redhat.com');
      change('subscription-base-url', 'https://cdn.stage.redhat.com/');
    }
  }, []);

  const setActivationKey = (_, selection) => {
    selectActivationKey(selection);
    setIsOpen(false);
    change(input.name, selection);
  };

  const handleClear = () => {
    selectActivationKey();
    change(input.name, undefined);
  };

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <FormGroup
        isRequired={isRequired}
        label={label}
        data-testid="subscription-activation-key"
      >
        <Select
          ouiaId="activation_key_select"
          variant={SelectVariant.typeahead}
          onToggle={handleToggle}
          onSelect={setActivationKey}
          onClear={handleClear}
          selections={activationKeySelected}
          isOpen={isOpen}
          placeholderText="Select activation key"
          typeAheadAriaLabel="Select activation key"
          isDisabled={!isSuccessActivationKeys}
        >
          {isSuccessActivationKeys &&
            activationKeys.body.map((key, index) => (
              <SelectOption key={index} value={key.name} />
            ))}
          {isFetchingActivationKeys && (
            <SelectOption
              isNoResultsOption={true}
              data-testid="activation-keys-loading"
            >
              <Spinner isSVG size="md" />
            </SelectOption>
          )}
        </Select>
      </FormGroup>
      {isErrorActivationKeys && (
        <Alert
          title="Activation keys unavailable"
          variant="danger"
          isPlain
          isInline
        >
          Activation keys cannot be reached, try again later.
        </Alert>
      )}
    </>
  );
};

ActivationKeys.propTypes = {
  label: PropTypes.node,
  isRequired: PropTypes.bool,
};

ActivationKeys.defaultProps = {
  label: '',
  isRequired: false,
};

export default ActivationKeys;
