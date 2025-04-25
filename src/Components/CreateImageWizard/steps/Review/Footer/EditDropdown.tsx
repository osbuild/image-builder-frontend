import React, { useEffect, useState } from 'react';

import {
  DropdownList,
  DropdownItem,
  MenuToggleAction,
  Spinner,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import { useUpdateBlueprintMutation } from '../../../../../store/backendApi';
import { useAppSelector } from '../../../../../store/hooks';
import {
  CreateBlueprintRequest,
  useComposeBlueprintMutation,
} from '../../../../../store/imageBuilderApi';
import { selectPackages } from '../../../../../store/wizardSlice';
import { createAnalytics } from '../../../../../Utilities/analytics';

type EditDropdownProps = {
  getBlueprintPayload: () => Promise<'' | CreateBlueprintRequest | undefined>;
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
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);

  const { analytics, auth, isBeta } = useChrome();
  useEffect(() => {
    (async () => {
      const data = await auth?.getUser();
      setUserData(data);
    })();
  }, [auth]);
  const [buildBlueprint] = useComposeBlueprintMutation();
  const packages = useAppSelector(selectPackages);

  const [updateBlueprint] = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });

  const onSaveAndBuild = async () => {
    const requestBody = await getBlueprintPayload();

    if (!process.env.IS_ON_PREMISE && requestBody) {
      const analyticsData = createAnalytics(requestBody, packages, isBeta);
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Blueprint Updated`, {
        ...analyticsData,
        type: 'editBlueprintAndBuildImages',
        account_id: userData?.identity.internal?.account_id || 'Not found',
      });
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Requested`, {
        module: AMPLITUDE_MODULE_NAME,
        trigger: 'blueprint_updated',
        image_request_types: requestBody.image_requests.map(
          (req) => req.image_type
        ),
      });
    }
    setIsOpen(false);
    if (requestBody) {
      await updateBlueprint({
        id: blueprintId,
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
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);

  const { analytics, auth, isBeta } = useChrome();
  useEffect(() => {
    (async () => {
      const data = await auth?.getUser();
      setUserData(data);
    })();
  }, [auth]);
  const packages = useAppSelector(selectPackages);

  const [updateBlueprint, { isLoading }] = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });
  const onSave = async () => {
    const requestBody = await getBlueprintPayload();

    if (!process.env.IS_ON_PREMISE && requestBody) {
      const analyticsData = createAnalytics(requestBody, packages, isBeta);
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Blueprint Updated`, {
        ...analyticsData,
        type: 'editBlueprint',
        account_id: userData?.identity.internal?.account_id || 'Not found',
      });
    }
    setIsOpen(false);
    if (requestBody) {
      updateBlueprint({ id: blueprintId, createBlueprintRequest: requestBody });
    }
  };
  return (
    <MenuToggleAction
      onClick={onSave}
      id="wizard-edit-save-btn"
      isDisabled={isDisabled}
    >
      <Flex display={{ default: 'inlineFlex' }}>
        {isLoading && (
          <FlexItem>
            <Spinner
              style={
                { '--pf-v5-c-spinner--Color': '#fff' } as React.CSSProperties
              }
              isInline
              size="md"
            />
          </FlexItem>
        )}
        <FlexItem>Save changes to blueprint</FlexItem>
      </Flex>
    </MenuToggleAction>
  );
};
