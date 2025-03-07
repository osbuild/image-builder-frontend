import React, { useEffect, useState } from 'react';

import {
  Alert,
  FormGroup,
  Spinner,
  Text,
  TextContent,
} from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import ManageKeysButton from './components/ManageKeysButton';
import PopoverActivation from './components/PopoverActivation';

import { CDN_PROD_URL, CDN_STAGE_URL } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  useListActivationKeysQuery,
  useCreateActivationKeysMutation,
} from '../../../../store/rhsmApi';
import {
  changeActivationKey,
  changeBaseUrl,
  changeServerUrl,
  selectActivationKey,
  selectRegistrationType,
} from '../../../../store/wizardSlice';
import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';
import { generateRandomId } from '../../utilities/generateRandomId';

const ActivationKeysList = () => {
  const dispatch = useAppDispatch();

  const activationKey = useAppSelector(selectActivationKey);
  const registrationType = useAppSelector(selectRegistrationType);

  const defaultActivationKeyName = `activation-key-default-${generateRandomId()}`;

  const { isProd } = useGetEnvironment();
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: activationKeys,
    isFetching: isFetchingActivationKeys,
    isSuccess: isSuccessActivationKeys,
    isError: isErrorActivationKeys,
    refetch,
  } = useListActivationKeysQuery();

  const [createActivationKey, { isLoading: isLoadingActivationKey }] =
    useCreateActivationKeysMutation();

  const recentActivationKey = window.localStorage.getItem(
    'imageBuilder.recentActivationKey'
  );

  useEffect(() => {
    if (isProd()) {
      dispatch(changeServerUrl('subscription.rhsm.redhat.com'));
      dispatch(changeBaseUrl(CDN_PROD_URL));
    } else {
      dispatch(changeServerUrl('subscription.rhsm.stage.redhat.com'));
      dispatch(changeBaseUrl(CDN_STAGE_URL));
    }
  }, [dispatch, isProd]);

  const setActivationKey = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: string
  ) => {
    setIsOpen(false);
    window.localStorage.setItem('imageBuilder.recentActivationKey', selection);
    dispatch(changeActivationKey(selection));
  };

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const isActivationKeysEmpty =
      isSuccessActivationKeys &&
      !isLoadingActivationKey &&
      activationKeys?.body?.length === 0;

    const handleCreateActivationKey = async () => {
      try {
        await createActivationKey({
          body: {
            name: defaultActivationKeyName,
            serviceLevel: 'Self-Support',
          },
        }).unwrap();

        window.localStorage.setItem(
          'imageBuilder.recentActivationKey',
          defaultActivationKeyName
        );
        dispatch(changeActivationKey(defaultActivationKeyName));
      } catch (error) {
        dispatch(
          addNotification({
            variant: 'danger',
            title: 'Error creating activation key',
            description: error?.data?.error?.message,
          })
        );
      }
    };

    if (isActivationKeysEmpty) {
      handleCreateActivationKey();
    }

    if (!activationKey && isSuccessActivationKeys) {
      if (
        recentActivationKey &&
        activationKeys?.body?.find((key) => key.name === recentActivationKey)
      ) {
        dispatch(changeActivationKey(recentActivationKey));
      } else if (
        activationKeys &&
        activationKeys.body &&
        activationKeys.body.length > 0
      ) {
        dispatch(changeActivationKey(activationKeys?.body[0].name));
      }
    }
  }, [isSuccessActivationKeys]);

  const setSelectOptions = () => {
    const selectOptions = [];
    if (isSuccessActivationKeys) {
      activationKeys?.body?.map((key, index) =>
        selectOptions.push(<SelectOption key={index} value={key.name} />)
      );
    }
    if (!isSuccessActivationKeys && isFetchingActivationKeys) {
      selectOptions.push(
        <SelectOption
          key={'Fetching'}
          isNoResultsOption={true}
          data-testid="activation-keys-loading"
        >
          <Spinner size="md" />
        </SelectOption>
      );
    }

    return selectOptions;
  };

  return (
    <>
      <FormGroup
        label={
          <>
            Activation key to use for this image <PopoverActivation />
          </>
        }
        data-testid="subscription-activation-key"
      >
        <Select
          ouiaId="activation_key_select"
          variant={SelectVariant.typeahead}
          onToggle={handleToggle}
          onSelect={setActivationKey}
          selections={
            registrationType === 'register-later' ? '' : activationKey
          }
          isOpen={isOpen}
          placeholderText="Select activation key"
          typeAheadAriaLabel="Select activation key"
          isDisabled={
            !isSuccessActivationKeys || registrationType === 'register-later'
          }
        >
          {setSelectOptions()}
        </Select>
        <TextContent>
          <Text>
            Create and manage activation keys on the <ManageKeysButton />
          </Text>
        </TextContent>
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

export default ActivationKeysList;
