import React from 'react';

import {
  DropdownList,
  DropdownItem,
  MenuToggleAction,
  Spinner,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import { useUpdateBlueprintMutation } from '../../../../../store/backendApi';
import { useAppSelector } from '../../../../../store/hooks';
import {
  CreateBlueprintRequest,
  useComposeBlueprintMutation,
} from '../../../../../store/imageBuilderApi';
import { selectPackages } from '../../../../../store/wizardSlice';
import { IBPackageWithRepositoryInfo } from '../../Packages/Packages';

type EditDropdownProps = {
  getBlueprintPayload: () => Promise<'' | CreateBlueprintRequest | undefined>;
  setIsOpen: (isOpen: boolean) => void;
  blueprintId: string;
  isDisabled: boolean;
};

const createAnalytics = (
  requestBody: CreateBlueprintRequest,
  packages: IBPackageWithRepositoryInfo[],
  isBeta: () => boolean
) => {
  const analyticsData = {
    image_name: requestBody.name,
    description: requestBody.description,
    distribution: requestBody.distribution,
    openscap: requestBody.customizations.openscap,
    image_request_types: requestBody.image_requests.map(
      (req) => req.image_type
    ),
    image_request_architectures: requestBody.image_requests.map(
      (req) => req.architecture
    ),
    imageRequests: requestBody.image_requests,
    customizations: requestBody.customizations,
    metadata: requestBody.metadata,
    packages: packages.map((pkg) => pkg.name),
    file_system_configuration: requestBody.customizations.filesystem,
    module: AMPLITUDE_MODULE_NAME,
    is_preview: isBeta(),
    type: 'createBlueprintAndBuildImages',
  };
  return analyticsData;
};

export const EditSaveAndBuildBtn = ({
  getBlueprintPayload,
  setIsOpen,
  blueprintId,
  isDisabled,
}: EditDropdownProps) => {
  const { analytics, isBeta } = useChrome();
  const [buildBlueprint] = useComposeBlueprintMutation();
  const packages = useAppSelector(selectPackages);

  const [updateBlueprint] = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });

  const onSaveAndBuild = async () => {
    const requestBody = await getBlueprintPayload();

    if (requestBody) {
      const analyticsData = createAnalytics(requestBody, packages, isBeta);
      analytics.track(
        `${AMPLITUDE_MODULE_NAME}-blueprintCreated`,
        analyticsData
      );
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Requested`, {
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
      <DropdownItem
        onClick={onSaveAndBuild}
        ouiaId="wizard-edit-build-btn"
        isDisabled={isDisabled}
      >
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
  const { analytics, isBeta } = useChrome();
  const packages = useAppSelector(selectPackages);

  const [updateBlueprint, { isLoading }] = useUpdateBlueprintMutation({
    fixedCacheKey: 'updateBlueprintKey',
  });
  const onSave = async () => {
    const requestBody = await getBlueprintPayload();

    if (requestBody) {
      const analyticsData = createAnalytics(requestBody, packages, isBeta);
      analytics.track(
        `${AMPLITUDE_MODULE_NAME}-blueprintCreated`,
        analyticsData
      );
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
