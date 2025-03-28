import React, { useState } from 'react';

import {
  DropdownList,
  DropdownItem,
  MenuToggleAction,
  Spinner,
  Flex,
  FlexItem,
  Modal,
  Button,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import { useCreateBlueprintMutation } from '../../../../../store/backendApi';
import { setBlueprintId } from '../../../../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  CreateBlueprintRequest,
  useComposeBlueprintMutation,
} from '../../../../../store/imageBuilderApi';
import { selectPackages } from '../../../../../store/wizardSlice';
import { useGetEnvironment } from '../../../../../Utilities/useGetEnvironment';

type CreateDropdownProps = {
  getBlueprintPayload: () => Promise<'' | CreateBlueprintRequest | undefined>;
  setIsOpen: (isOpen: boolean) => void;
  isDisabled: boolean;
};

export const CreateSaveAndBuildBtn = ({
  getBlueprintPayload,
  setIsOpen,
  isDisabled,
}: CreateDropdownProps) => {
  const { analytics, isBeta } = useChrome();
  const packages = useAppSelector(selectPackages);

  const [buildBlueprint] = useComposeBlueprintMutation();
  const [createBlueprint] = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });
  const dispatch = useAppDispatch();
  const { isFedoraEnv } = useGetEnvironment();
  const onSaveAndBuild = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);

    if (!process.env.IS_ON_PREMISE && !isFedoraEnv) {
      analytics.track(`${AMPLITUDE_MODULE_NAME}-blueprintCreated`, {
        module: AMPLITUDE_MODULE_NAME,
        isPreview: isBeta(),
        type: 'createBlueprintAndBuildImages',
        packages: packages.map((pkg) => pkg.name),
      });
    }

    const blueprint =
      requestBody &&
      (await createBlueprint({
        createBlueprintRequest: requestBody,
      }).unwrap()); // unwrap - access the success payload immediately after a mutation

    if (blueprint) {
      buildBlueprint({ id: blueprint.id, body: {} });
      dispatch(setBlueprintId(blueprint.id));
    }
  };

  return (
    <DropdownList>
      <DropdownItem
        onClick={onSaveAndBuild}
        ouiaId="wizard-create-build-btn"
        isDisabled={isDisabled}
      >
        Create blueprint and build image(s)
      </DropdownItem>
    </DropdownList>
  );
};

export const CreateSaveButton = ({
  setIsOpen,
  getBlueprintPayload,
  isDisabled,
}: CreateDropdownProps) => {
  const { analytics, isBeta } = useChrome();
  const packages = useAppSelector(selectPackages);
  const { isFedoraEnv } = useGetEnvironment();

  const [createBlueprint, { isLoading }] = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const wasModalSeen = window.localStorage.getItem(
    'imageBuilder.saveAndBuildModalSeen'
  );

  const SaveAndBuildImagesModal = () => {
    const handleClose = () => {
      setShowModal(false);
    };

    return (
      <Modal
        title="Save time by building images"
        isOpen={showModal}
        onClose={handleClose}
        width="50%"
        actions={[
          <Button
            key="back"
            variant="primary"
            data-testid="close-button-saveandbuild-modal"
            onClick={handleClose}
          >
            Close
          </Button>,
        ]}
      >
        Building blueprints and images doesn’t need to be a two step process. To
        build images simultaneously, use the dropdown arrow to the right side of
        this button.
      </Modal>
    );
  };

  const onClick = () => {
    if (!wasModalSeen) {
      setShowModal(true);
      window.localStorage.setItem('imageBuilder.saveAndBuildModalSeen', 'true');
    } else {
      onSave();
    }
  };

  const onSave = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);

    if (!process.env.IS_ON_PREMISE && !isFedoraEnv) {
      analytics.track(`${AMPLITUDE_MODULE_NAME}-blueprintCreated`, {
        module: AMPLITUDE_MODULE_NAME,
        isPreview: isBeta(),
        type: 'createBlueprint',
        packages: packages.map((pkg) => pkg.name),
      });
    }
    const blueprint =
      requestBody &&
      (await createBlueprint({
        createBlueprintRequest: requestBody,
      }).unwrap());
    if (blueprint) {
      dispatch(setBlueprintId(blueprint?.id));
    }
  };

  return (
    <>
      {showModal && <SaveAndBuildImagesModal />}
      <MenuToggleAction
        onClick={onClick}
        id="wizard-create-save-btn"
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
          <FlexItem>Create blueprint</FlexItem>
        </Flex>
      </MenuToggleAction>
    </>
  );
};
