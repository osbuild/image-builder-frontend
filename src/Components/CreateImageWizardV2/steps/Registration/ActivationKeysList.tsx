import React, { useEffect, useState } from 'react';

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
  Text,
  TextContent,
  Popover,
} from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { WrenchIcon, AddCircleOIcon } from '@patternfly/react-icons';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

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
} from '../../../../store/wizardSlice';
import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';

const PopoverActivation = () => {
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
            {orgId && <br />}
            {orgId && "Your organization's ID is " + orgId}
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Activation key popover"
        aria-describedby="subscription-activation-key"
        className="pf-c-form__group-label-help"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

type EmptyActivationsKeyStateProps = {
  handleActivationKeyFn: Function;
  isLoading: boolean;
};

const EmptyActivationsKeyState = ({
  handleActivationKeyFn,
  isLoading,
}: EmptyActivationsKeyStateProps) => (
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
          onClick={() => handleActivationKeyFn()}
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
      href={
        isProd()
          ? 'https://console.redhat.com/insights/connector/activation-keys'
          : 'https://console.stage.redhat.com/insights/connector/activation-keys'
      }
    >
      Activation keys page
    </Button>
  );
};

const ActivationKeysList = () => {
  const dispatch = useAppDispatch();

  const activationKey = useAppSelector((state) => selectActivationKey(state));

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

  useEffect(() => {
    if (isProd()) {
      dispatch(changeServerUrl('subscription.rhsm.redhat.com'));
      dispatch(changeBaseUrl('https://cdn.redhat.com/'));
    } else {
      dispatch(changeServerUrl('subscription.rhsm.stage.redhat.com'));
      dispatch(changeBaseUrl('https://cdn.stage.redhat.com/'));
    }
  }, [dispatch, isProd]);

  const setActivationKey = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: string
  ) => {
    setIsOpen(false);
    dispatch(changeActivationKey(selection));
  };

  const handleClear = () => {
    dispatch(changeActivationKey(undefined));
  };

  const handleToggle = () => {
    if (!isOpen) {
      refetch();
    }
    setIsOpen(!isOpen);
  };

  const handleCreateActivationKey = async () => {
    try {
      await createActivationKey({
        body: {
          name: 'activation-key-default',
          serviceLevel: 'Self-Support',
        },
      });
      refetch();
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

  const setSelectOptions = () => {
    const selectOptions = [];
    if (isActivationKeysEmpty) {
      selectOptions.push(
        <EmptyActivationsKeyState
          handleActivationKeyFn={handleCreateActivationKey}
          isLoading={isLoadingActivationKey}
          key={'Empty'}
        />
      );
    }
    if (isSuccessActivationKeys) {
      activationKeys.body?.map((key, index) =>
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

  const isActivationKeysEmpty =
    isSuccessActivationKeys && activationKeys.body?.length === 0;

  return (
    <>
      <FormGroup
        isRequired={true}
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
          onClear={handleClear}
          selections={activationKey}
          isOpen={isOpen}
          placeholderText="Select activation key"
          typeAheadAriaLabel="Select activation key"
          isDisabled={!isSuccessActivationKeys}
        >
          {setSelectOptions()}
        </Select>
        <TextContent>
          <Text>
            By default, activation key is generated and preset for you. Admins
            can create and manage keys by visiting the <ManageKeysButton />
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
