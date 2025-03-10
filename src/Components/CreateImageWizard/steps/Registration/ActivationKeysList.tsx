import React, { useEffect, useState } from 'react';

import {
  Alert,
  FormGroup,
  Spinner,
  Button,
  Text,
  TextContent,
  Popover,
} from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import {
  ACTIVATION_KEYS_PROD_URL,
  ACTIVATION_KEYS_STAGE_URL,
  CDN_PROD_URL,
  CDN_STAGE_URL,
} from '../../../../constants';
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

export const PopoverActivation = () => {
  const [orgId, setOrgId] = useState<string | undefined>(undefined);
  const { auth } = useChrome();

  useEffect(() => {
    (async () => {
      const userData = await auth?.getUser();
      const id = userData?.identity?.internal?.org_id;
      setOrgId(id);
    })();
  });
  return (
    <Popover
      hasAutoWidth
      maxWidth="35rem"
      bodyContent={
        <TextContent>
          <Text>
            Activation keys enable you to register a system with appropriate
            subscriptions, system purpose, and repositories attached.
          </Text>
          <Text>
            If using an activation key with command line registration, you must
            provide your organization&apos;s ID.
          </Text>
          {orgId ? (
            <Text>Your organization&apos;s ID is {orgId}</Text>
          ) : (
            <Spinner size="md" />
          )}
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Activation key popover"
        aria-describedby="subscription-activation-key"
        className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0 pf-v5-u-pr-0"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

const ManageKeysButton = () => {
  const { isProd } = useGetEnvironment();
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={isProd() ? ACTIVATION_KEYS_PROD_URL : ACTIVATION_KEYS_STAGE_URL}
    >
      Activation keys page
    </Button>
  );
};

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
          },
        });
        window.localStorage.setItem(
          'imageBuilder.recentActivationKey',
          defaultActivationKeyName
        );
        refetch();
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
          selections={activationKey}
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
