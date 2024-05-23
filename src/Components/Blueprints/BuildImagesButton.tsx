import React, { useState } from 'react';

import {
  Dropdown,
  MenuToggle,
  MenuToggleElement,
  Menu,
  MenuContent,
  MenuList,
  MenuItem,
  Flex,
  FlexItem,
  Spinner,
  MenuToggleAction,
  ButtonProps,
  Button,
} from '@patternfly/react-core';
import { skipToken } from '@reduxjs/toolkit/query';

import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  ImageTypes,
  useComposeBlueprintMutation,
  useGetBlueprintQuery,
} from '../../store/imageBuilderApi';
import {addNotification} from "@redhat-cloud-services/frontend-components-notifications/redux";

export const BuildImagesButton = () => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const [deselectedTargets, setDeselectedTargets] = useState<ImageTypes[]>([]);
  const [buildBlueprint, { isLoading: imageBuildLoading, isError: imageBuildError }] =
      useComposeBlueprintMutation();
  const dispatch = useAppDispatch();

  const onBuildHandler = async () => {
    if (selectedBlueprintId) {
      try{
      await buildBlueprint({
        id: selectedBlueprintId,
        body: {
          image_types: blueprintImageType?.filter(
            (target) => !deselectedTargets?.includes(target)
          ),
        },
      })}
      catch(imageBuildError) {
        dispatch(
            addNotification({
                  variant: 'warning',
                  title: 'No blueprint was build',
                })
            );
      }
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };
  const { data: blueprintDetails } = useGetBlueprintQuery(
    selectedBlueprintId ? { id: selectedBlueprintId } : skipToken
  );
  const blueprintImageType = blueprintDetails?.image_requests.map(
    (image) => image.image_type
  );

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    itemId: number
  ) => {
    const imageType = blueprintImageType?.[itemId];

    if (imageType && deselectedTargets?.includes(imageType)) {
      setDeselectedTargets(
        deselectedTargets.filter((target) => target !== imageType)
      );
    } else if (imageType) {
      setDeselectedTargets([...deselectedTargets, imageType]);
    }
  };

  const handleToggleEnvironment = (target: ImageTypes) => {
    switch (target) {
      case 'aws':
        return 'Amazon Web Services (AWS)';
      case 'gcp':
        return 'Google Cloud Platform (GCP)';
      case 'azure':
        return 'Microsoft Azure';
      case 'oci':
        return 'Oracle Cloud Infrastructure';
      case 'vsphere-ova':
        return 'VMware vSphere';
      case 'guest-image':
        return 'Virtualization - Guest image (.qcow2)';
      case 'image-installer':
        return 'Bare metal - Installer';
    }
  };
  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          variant="primary"
          ref={toggleRef}
          isFullWidth
          onClick={onToggleClick}
          isExpanded={isOpen}
          splitButtonOptions={{
            variant: 'action',
            items: [
              <MenuToggleAction
                key="split-action"
                onClick={onBuildHandler}
                id="wizard-build-image-btn"
                isDisabled={
                  !selectedBlueprintId ||
                  deselectedTargets.length === blueprintImageType?.length
                }
              >
                <Flex display={{ default: 'inlineFlex' }}>
                  {imageBuildLoading && (
                    <FlexItem>
                      <Spinner
                        style={
                          {
                            '--pf-v5-c-spinner--Color': '#fff',
                          } as React.CSSProperties
                        }
                        isInline
                        size="md"
                      />
                    </FlexItem>
                  )}
                  <FlexItem>
                    {deselectedTargets.length !== 0
                      ? 'Build selected'
                      : 'Build image'}
                  </FlexItem>
                </Flex>
              </MenuToggleAction>,
            ],
          }}
        ></MenuToggle>
      )}
    >
      <Menu onSelect={onSelect} selected={blueprintImageType}>
        <MenuContent>
          <MenuList>
            {blueprintImageType?.map((imageType, index) => (
              <MenuItem
                key={imageType}
                hasCheckbox
                itemId={index}
                isSelected={
                  !deselectedTargets || !deselectedTargets.includes(imageType)
                }
              >
                {handleToggleEnvironment(imageType)}
              </MenuItem>
            ))}
          </MenuList>
        </MenuContent>
      </Menu>
    </Dropdown>
  );
};

type BuildImagesButtonEmptyStatePropTypes = {
  variant?: ButtonProps['variant'];
  children?: React.ReactNode;
};

export const BuildImagesButtonEmptyState = ({
  variant,
  children,
}: BuildImagesButtonEmptyStatePropTypes) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const [buildBlueprint, { isLoading: imageBuildLoading }] =
    useComposeBlueprintMutation();
  const onBuildHandler = async () => {
    selectedBlueprintId &&
      (await buildBlueprint({ id: selectedBlueprintId, body: {} }));
  };
  return (
    <Button
      ouiaId="build-images-button"
      onClick={onBuildHandler}
      isDisabled={!selectedBlueprintId}
      isLoading={imageBuildLoading}
      variant={variant}
    >
      {children ? children : 'Build images'}
    </Button>
  );
};
