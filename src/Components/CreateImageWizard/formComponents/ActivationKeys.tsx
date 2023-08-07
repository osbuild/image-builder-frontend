import React, { useState } from 'react';

import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import UseFormApiConfig from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Alert,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';

import {
  ListActivationKeysApiResponse as LAKT,
  ActivationKeys as AKT,
  useListActivationKeysQuery,
} from '../../../store/rhsmApi';
import { useGetEnvironment } from '../../../Utilities/useGetEnvironment';

const ActivationKeys = ({
  label,
  isRequired,
  option,
}: ActivationKeysPropTypes) => {
  const { isProd } = useGetEnvironment();
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(option);
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
  } = useListActivationKeysQuery();

  if (
    getState()?.values?.['subscription-server-url'] === undefined ||
    getState()?.values?.['subscription-base-url'] === undefined
  ) {
    if (isProd()) {
      change('subscription-server-url', 'subscription.rhsm.redhat.com');
      change('subscription-base-url', 'https://cdn.redhat.com/');
    } else {
      change('subscription-server-url', 'subscription.rhsm.stage.redhat.com');
      change('subscription-base-url', 'https://cdn.stage.redhat.com/');
    }
  }

  const setActivationKey = (_unused: React.MouseEvent, selection: string) => {
    selectActivationKey(selection);
    setIsOpen(false);
    change(input.name, selection);
  };

  const handleClear = () => {
    selectActivationKey(null);
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
          <ActivationKeysSelectOptions
            isFetching={isFetchingActivationKeys}
            hasData={isSuccessActivationKeys}
            activationKeys={activationKeys}
          />
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

const ActivationKeysSelectOptions = ({
  isFetching,
  hasData,
  activationKeys,
}: ActivationKeysSelectOptionsTypes) => {
  if (isFetching) {
    return (
      <>
        <SelectOption
          isNoResultsOption={true}
          data-testid="activation-keys-loading"
        >
          <Spinner isSVG size="md" />
        </SelectOption>
      </>
    );
  }
  if (!hasData) {
    return <></>;
  }
  if (!activationKeys.body) {
    return <></>;
  }
  return (
    <>
      {activationKeys.body.map((key, index) => (
        <SelectOption key={index} value={key.name} />
      ))}
    </>
  );
};

type ActivationKeysSelectOptionsTypes = {
  isFetching: boolean;
  hasData: boolean;
  activationKeys: LAKT;
};

type ActivationKeysPropTypes = {
  label: React.ReactNode;
  isRequired: boolean;
  option: typeof UseFormApiConfig;
};

ActivationKeys.defaultProps = {
  label: '',
  isRequired: false,
};

export default ActivationKeys;
