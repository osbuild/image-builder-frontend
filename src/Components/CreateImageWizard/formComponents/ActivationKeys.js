import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  Spinner,
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import api from '../../../api';

const ActivationKeys = ({ label, isRequired, ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [activationKeys, setActivationKeys] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activationKeySelected, selectActivationKey] = useState(
    getState()?.values?.['subscription-activation-key']
  );

  useEffect(() => {
    setIsLoading(true);
    const data = api.getActivationKeys();
    data.then((keys) => {
      setActivationKeys(keys);
      setIsLoading(false);
    });

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

  return (
    <FormGroup
      isRequired={isRequired}
      label={label}
      data-testid="subscription-activation-key"
    >
      <Select
        variant={SelectVariant.typeahead}
        onToggle={() => setIsOpen(!isOpen)}
        onSelect={setActivationKey}
        onClear={handleClear}
        selections={activationKeySelected}
        isOpen={isOpen}
        placeholderText="Select activation key"
        typeAheadAriaLabel="Select activation key"
      >
        {isLoading && (
          <SelectOption
            isNoResultsOption={true}
            data-testid="activation-keys-loading"
          >
            <Spinner isSVG size="lg" />
          </SelectOption>
        )}
        {activationKeys.map((key, index) => (
          <SelectOption key={index} value={key.name} />
        ))}
      </Select>
    </FormGroup>
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
