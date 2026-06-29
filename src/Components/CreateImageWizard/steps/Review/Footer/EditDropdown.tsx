import React from 'react';

import {
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggleAction,
  Spinner,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { CreateBlueprintRequest } from '@/store/api/backend';
import {
  useAppSelector,
  // store.getState() in click handlers to build request body
  // eslint-disable-next-line no-restricted-syntax
  useAppStore,
} from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { mapStateToRequest, selectPackages } from '@/store/slices/wizard';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import {
  useComposeBPWithNotification as useComposeBlueprintMutation,
  useGetUser,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../../../Hooks';
import { createAnalytics } from '../../../../../Utilities/analytics';

type EditDropdownProps = {
  setIsOpen: (isOpen: boolean) => void;
  blueprintId: string;
  isDisabled: boolean;
};

export const EditSaveAndBuildBtn = ({
  setIsOpen,
  blueprintId,
  isDisabled,
}: EditDropdownProps) => {
  const { analytics, auth, isBeta } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const { trigger: buildBlueprint } = useComposeBlueprintMutation();
  const packages = useAppSelector(selectPackages);
  const store = useAppStore();

  const { trigger: updateBlueprint } = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });

  const onSaveAndBuild = async () => {
    const requestBody = mapStateToRequest(store.getState());

    if (!isOnPremise) {
      const analyticsData = createAnalytics(
        requestBody as CreateBlueprintRequest,
        packages,
        isBeta,
      );
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Blueprint Updated`, {
        ...analyticsData,
        type: 'editBlueprintAndBuildImages',
        account_id: userData?.identity.internal?.account_id || 'Not found',
      });
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Requested`, {
        module: AMPLITUDE_MODULE_NAME,
        trigger: 'blueprint_updated',
        image_request_types: requestBody.image_requests.map(
          (req) => req.image_type,
        ),
      });
    }
    setIsOpen(false);
    await updateBlueprint({
      id: blueprintId,
      createBlueprintRequest: requestBody as CreateBlueprintRequest,
    });
    buildBlueprint({ id: blueprintId, body: {} });
  };

  return (
    <DropdownList>
      <DropdownItem onClick={onSaveAndBuild} isDisabled={isDisabled}>
        Save changes and build image(s)
      </DropdownItem>
    </DropdownList>
  );
};

export const EditSaveButton = ({
  setIsOpen,
  blueprintId,
  isDisabled,
}: EditDropdownProps) => {
  const { analytics, auth, isBeta } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const packages = useAppSelector(selectPackages);
  const store = useAppStore();

  const { trigger: updateBlueprint, isLoading } = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });
  const onSave = async () => {
    const requestBody = mapStateToRequest(store.getState());

    if (!isOnPremise) {
      const analyticsData = createAnalytics(
        requestBody as CreateBlueprintRequest,
        packages,
        isBeta,
      );
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Blueprint Updated`, {
        ...analyticsData,
        type: 'editBlueprint',
        account_id: userData?.identity.internal?.account_id || 'Not found',
      });
    }
    setIsOpen(false);
    updateBlueprint({
      id: blueprintId,
      createBlueprintRequest: requestBody as CreateBlueprintRequest,
    });
  };
  return (
    <MenuToggleAction
      onClick={onSave}
      id='wizard-edit-save-btn'
      isDisabled={isDisabled}
    >
      <Flex display={{ default: 'inlineFlex' }}>
        {isLoading && (
          <FlexItem>
            <Spinner
              style={
                {
                  '--pf-v6-c-spinner--Color':
                    'var(--pf-t--global--text--color--on-brand--default)',
                } as React.CSSProperties
              }
              isInline
              size='md'
            />
          </FlexItem>
        )}
        <FlexItem>Save changes to blueprint</FlexItem>
      </Flex>
    </MenuToggleAction>
  );
};
