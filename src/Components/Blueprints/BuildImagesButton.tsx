import React, { useEffect, useState } from 'react';

import {
  Dropdown,
  MenuToggle,
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
import { MenuToggleElement } from '@patternfly/react-core/dist/esm/components/MenuToggle/MenuToggle';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { ChromeUser } from '@redhat-cloud-services/types';
import { skipToken } from '@reduxjs/toolkit/query';

import { AMPLITUDE_MODULE_NAME, targetOptions } from '../../constants';
import {
  useGetBlueprintQuery,
  useComposeBlueprintMutation,
} from '../../store/backendApi';
import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ImageTypes } from '../../store/imageBuilderApi';

type BuildImagesButtonPropTypes = {
  // default children is 'Build images'
  children?: React.ReactNode;
};

export const BuildImagesButton = ({ children }: BuildImagesButtonPropTypes) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const [deselectedTargets, setDeselectedTargets] = useState<ImageTypes[]>([]);
  const [buildBlueprint, { isLoading: imageBuildLoading }] =
    useComposeBlueprintMutation();
  const dispatch = useAppDispatch();
  const { analytics, auth } = useChrome();

  const [userData, setUserData] = useState<ChromeUser | void>(undefined);

  useEffect(() => {
    (async () => {
      const data = await auth?.getUser();
      setUserData(data);
    })();
  }, [auth]);

  const onBuildHandler = async () => {
    if (selectedBlueprintId) {
      try {
        await buildBlueprint({
          id: selectedBlueprintId,
          body: {
            image_types: blueprintImageType?.filter(
              (target) => !deselectedTargets.includes(target)
            ),
          },
        });
        analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Requested`, {
          module: AMPLITUDE_MODULE_NAME,
          trigger: 'synchronize images',
          account_id: userData?.identity.internal?.account_id || 'Not found',
        });
      } catch (imageBuildError) {
        dispatch(
          addNotification({
            variant: 'warning',
            title: 'No blueprint was build',
            description: imageBuildError?.data?.error?.message,
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

    if (imageType && deselectedTargets.includes(imageType)) {
      setDeselectedTargets(
        deselectedTargets.filter((target) => target !== imageType)
      );
    } else if (imageType) {
      setDeselectedTargets([...deselectedTargets, imageType]);
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          variant="primary"
          data-testid="blueprint-build-image-menu"
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          splitButtonItems={[
            <MenuToggleAction
              data-testid="blueprint-build-image-menu-option"
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
                          '--pf-v6-c-spinner--Color': '#fff',
                        } as React.CSSProperties
                      }
                      isInline
                      size="md"
                    />
                  </FlexItem>
                )}
                <FlexItem>{children ? children : 'Build images'}</FlexItem>
              </Flex>
            </MenuToggleAction>,
          ]}
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
                  deselectedTargets.length === 0 ||
                  !deselectedTargets.includes(imageType)
                }
              >
                {targetOptions[imageType]}
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
    if (selectedBlueprintId) {
      await buildBlueprint({ id: selectedBlueprintId, body: {} });
    }
  };
  return (
    <Button
      onClick={onBuildHandler}
      isDisabled={!selectedBlueprintId}
      isLoading={imageBuildLoading}
      variant={variant || 'primary'}
    >
      {children ? children : 'Build images'}
    </Button>
  );
};
