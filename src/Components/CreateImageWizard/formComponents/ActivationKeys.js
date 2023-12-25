import React, { useEffect, useState } from 'react';

import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Alert,
  FormGroup,
  Spinner,
  EmptyState,
  Button,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateFooter,
  EmptyStateActions,
} from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { WrenchIcon, AddCircleOIcon } from '@patternfly/react-icons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  useListActivationKeysQuery,
  useCreateActivationKeysMutation,
} from '../../../store/rhsmApi';
import { useGetEnvironment } from '../../../Utilities/useGetEnvironment';

const EmptyActivationsKeyState = ({ handleActivationKeyFn, isLoading }) => (
  <EmptyState variant="xs">
    <EmptyStateHeader
      titleText="No activation keys found"
      headingLevel="h4"
      icon={<EmptyStateIcon icon={WrenchIcon} />}
    />
    <EmptyStateBody>
      Get started by building a default key, which will be generated and present
      for you.
    </EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>
        <Button
          onClick={handleActivationKeyFn}
          icon={<AddCircleOIcon />}
          isLoading={isLoading}
          iconPosition="left"
          variant="link"
        >
          Create activation key
        </Button>
      </EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

EmptyActivationsKeyState.propTypes = {
  handleActivationKeyFn: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

const ActivationKeys = ({ label, isRequired, ...props }) => {
  const { isProd } = useGetEnvironment();
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [isOpen, setIsOpen] = useState(false);
  const [activationKeySelected, selectActivationKey] = useState(
    getState()?.values?.['subscription-activation-key']
  );

  const dispatch = useDispatch();

  const {
    data: activationKeys,
    isFetching: isFetchingActivationKeys,
    isSuccess: isSuccessActivationKeys,
    isError: isErrorActivationKeys,
    refetch,
  } = useListActivationKeysQuery();

  const [createActivationKey, { isLoading: isLoadingActivationKey }] =
    useCreateActivationKeysMutation();
  useEffect(() => {
    if (isProd()) {
      change('subscription-server-url', 'subscription.rhsm.redhat.com');
      change('subscription-base-url', 'https://cdn.redhat.com/');
    } else {
      change('subscription-server-url', 'subscription.rhsm.stage.redhat.com');
      change('subscription-base-url', 'https://cdn.stage.redhat.com/');
    }
  }, [isProd, change]);

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

  const handleCreateActivationKey = async () => {
    const res = await createActivationKey({
      body: {
        name: 'activation-key-default',
        serviceLevel: 'Self-Support',
      },
    });
    refetch();
    if (res.error) {
      dispatch(
        addNotification({
          variant: 'danger',
          title: 'Error creating activation key',
          description: res.error?.data?.error?.message,
        })
      );
    }
  };

  const isActivationKeysEmpty =
    isSuccessActivationKeys && activationKeys.body.length === 0;

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
          {isActivationKeysEmpty && (
            <EmptyActivationsKeyState
              handleActivationKeyFn={handleCreateActivationKey}
              isLoading={isLoadingActivationKey}
            />
          )}
          {isSuccessActivationKeys &&
            activationKeys.body.map((key, index) => (
              <SelectOption key={index} value={key.name} />
            ))}
          {!isSuccessActivationKeys && isFetchingActivationKeys && (
            <SelectOption
              isNoResultsOption={true}
              data-testid="activation-keys-loading"
            >
              <Spinner size="md" />
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
