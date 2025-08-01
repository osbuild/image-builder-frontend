import React, { useEffect, useState } from 'react';

import {
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggleAction,
  Spinner,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import {
  useComposeBPWithNotification as useComposeBlueprintMutation,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../../../Hooks';
import { CockpitCreateBlueprintRequest } from '../../../../../store/cockpit/types';
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
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);

  const { analytics, auth, isBeta } = useChrome();

  useEffect(() => {
    (async () => {
      const data = await auth.getUser();
      setUserData(data);
    })();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { trigger: buildBlueprint } = useComposeBlueprintMutation();
  const packages = useAppSelector(selectPackages);

  const { trigger: updateBlueprint } = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });

  const onSaveAndBuild = async () => {
    const requestBody = await getBlueprintPayload();

    if (!process.env.IS_ON_PREMISE && requestBody) {
      const analyticsData = createAnalytics(
        requestBody as CreateBlueprintRequest,
        packages,
        isBeta
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
      const data = await auth.getUser();
      setUserData(data);
    })();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const packages = useAppSelector(selectPackages);

  const { trigger: updateBlueprint, isLoading } = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });
  const onSave = async () => {
    const requestBody = await getBlueprintPayload();

    if (!process.env.IS_ON_PREMISE && requestBody) {
      const analyticsData = createAnalytics(
        requestBody as CreateBlueprintRequest,
        packages,
        isBeta
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
        createBlueprintRequest: requestBody,
      });
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
                { '--pf-v6-c-spinner--Color': '#fff' } as React.CSSProperties
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
