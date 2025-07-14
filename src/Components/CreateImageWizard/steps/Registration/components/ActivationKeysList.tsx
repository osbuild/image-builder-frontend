import React, { useEffect, useState } from 'react';

import {
  Alert,
  FormGroup,
  Spinner,
  Select,
  SelectList,
  SelectOption,
  Content,
  MenuToggleElement,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

import ManageKeysButton from './ManageKeysButton';

import { CDN_PROD_URL, CDN_STAGE_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  useListActivationKeysQuery,
  useCreateActivationKeysMutation,
} from '../../../../../store/rhsmApi';
import {
  changeActivationKey,
  changeBaseUrl,
  changeServerUrl,
  selectActivationKey,
  selectRegistrationType,
} from '../../../../../store/wizardSlice';
import sortfn from '../../../../../Utilities/sortfn';
import { useGetEnvironment } from '../../../../../Utilities/useGetEnvironment';
import { generateRandomId } from '../../../utilities/generateRandomId';

const ActivationKeysList = () => {
  const dispatch = useAppDispatch();
  const addNotification = useAddNotification();

  const activationKey = useAppSelector(selectActivationKey);
  const registrationType = useAppSelector(selectRegistrationType);

  const defaultActivationKeyName = `activation-key-default-${generateRandomId()}`;

  const { isProd } = useGetEnvironment();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

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

  const [selectOptions, setSelectOptions] = useState<(string | undefined)[]>(
    activationKeys?.body ? activationKeys.body.map((key) => key.name) : []
  );

  useEffect(() => {
    let filteredKeys = activationKeys?.body?.map((key) => key.name);

    if (filterValue) {
      filteredKeys = activationKeys?.body
        ?.map((key) => key.name)
        .filter((keyName: string) =>
          String(keyName).toLowerCase().includes(filterValue.toLowerCase())
        );
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    if (filteredKeys) {
      setSelectOptions(filteredKeys.sort((a, b) => sortfn(a, b, filterValue)));
    }

    // This useEffect hook should run *only* on when the filter value
    // or the original array of keys changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, activationKeys?.body]);

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
        addNotification({
          variant: 'danger',
          title: 'Error creating activation key',
          description: error?.data?.error?.message,
        });
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

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setInputValue(value);
    setFilterValue(value);

    if (value !== activationKey) {
      dispatch(changeActivationKey(''));
    }
  };

  const prepareSelectOptions = () => {
    const selectOptionsElement = [];

    if (isSuccessActivationKeys) {
      selectOptions.map((key, index) =>
        selectOptionsElement.push(
          <SelectOption key={index} value={key}>
            {key}
          </SelectOption>
        )
      );
    }

    if (isFetchingActivationKeys) {
      selectOptionsElement.push(
        <SelectOption key="Fetching" value="loader">
          <Spinner size="md" />
        </SelectOption>
      );
    }

    if (isSuccessActivationKeys && selectOptions.length === 0) {
      selectOptionsElement.push(
        <SelectOption key="no_results" value="no_results" isDisabled>
          No results found
        </SelectOption>
      );
    }

    return selectOptionsElement;
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={handleToggle}
      isExpanded={isOpen}
      data-testid="activation-key-select"
      isDisabled={
        !isSuccessActivationKeys ||
        registrationType === 'register-later' ||
        registrationType === 'register-satellite'
      }
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={
            activationKey
              ? registrationType === 'register-later' ||
                registrationType === 'register-satellite'
                ? ''
                : activationKey
              : inputValue
          }
          onClick={handleToggle}
          onChange={onTextInputChange}
          autoComplete="off"
          placeholder="Select activation key"
          isExpanded={isOpen}
        />
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <>
      <FormGroup label="Activation key to use for this image">
        <Select
          isScrollable
          isOpen={isOpen}
          selected={activationKey}
          onSelect={setActivationKey}
          onOpenChange={handleToggle}
          toggle={toggle}
          shouldFocusFirstItemOnOpen={false}
        >
          <SelectList>{prepareSelectOptions()}</SelectList>
        </Select>
        <Content>
          <Content>
            Create and manage activation keys on the <ManageKeysButton />
          </Content>
        </Content>
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
