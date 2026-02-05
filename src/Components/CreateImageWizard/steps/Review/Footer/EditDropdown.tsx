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

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import {
  useComposeBPWithNotification as useComposeBlueprintMutation,
  useGetUser,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../../../Hooks';
import { CockpitCreateBlueprintRequest } from '../../../../../store/cockpit/types';
import { selectIsOnPremise } from '../../../../../store/envSlice';
import { useAppSelector } from '../../../../../store/hooks';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { selectPackages } from '../../../../../store/wizardSlice';
import { createAnalytics } from '../../../../../Utilities/analytics';

type EditDropdownProps = {
  getBlueprintPayload: () => Promise<
    '' | CreateBlueprintRequest | CockpitCreateBlueprintRequest | undefined
  >;
  setIsOpen: (isOpen: boolean) => void;
  blueprintId: string;
  isDisabled: boolean;
};

export const EditSaveAndBuildBtn = ({
  getBlueprintPayload,
  setIsOpen,
  blueprintId,
  isDisabled,
}: EditDropdownProps) => {
  const { analytics, auth, isBeta } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const { trigger: buildBlueprint } = useComposeBlueprintMutation();
  const packages = useAppSelector(selectPackages);

  const { trigger: updateBlueprint } = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });

  const onSaveAndBuild = async () => {
    const requestBody = await getBlueprintPayload();

    if (!isOnPremise && requestBody) {
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
    if (requestBody) {
      await updateBlueprint({
        id: blueprintId,
        // NOTE: We're using 'image-mode' as a dummy distribution for the
        // on-prem frontend, this is one of the few cases where we
        // can't work around the type error. This is fine because
        // on-prem can handle this, while the hosted service should
        // never receive 'image-mode' as a distribution.
        // @ts-ignore see above note (this errors when running npm run build)
        createBlueprintRequest: requestBody,
      });
    }
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
  getBlueprintPayload,
  blueprintId,
  isDisabled,
}: EditDropdownProps) => {
  const { analytics, auth, isBeta } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const packages = useAppSelector(selectPackages);

  const { trigger: updateBlueprint, isLoading } = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });
  const onSave = async () => {
    const requestBody = await getBlueprintPayload();

    if (!isOnPremise && requestBody) {
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
    if (requestBody) {
      updateBlueprint({
        id: blueprintId,
        // NOTE: We're using 'image-mode' as a dummy distribution for the
        // on-prem frontend, this is one of the few cases where we
        // can't work around the type error. This is fine because
        // on-prem can handle this, while the hosted service should
        // never receive 'image-mode' as a distribution
        // @ts-ignore see above note (this errors when running npm run build)
        createBlueprintRequest: requestBody,
      });
    }
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
                { '--pf-v6-c-spinner--Color': '#fff' } as React.CSSProperties
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
