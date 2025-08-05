import React, { useEffect, useState } from 'react';

import {
  Button,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggleAction,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import {
  useComposeBPWithNotification as useComposeBlueprintMutation,
  useCreateBPWithNotification as useCreateBlueprintMutation,
} from '../../../../../Hooks';
import { setBlueprintId } from '../../../../../store/BlueprintSlice';
import { CockpitCreateBlueprintRequest } from '../../../../../store/cockpit/types';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  CreateBlueprintRequest,
  CreateBlueprintResponse,
} from '../../../../../store/imageBuilderApi';
import { selectPackages } from '../../../../../store/wizardSlice';
import { createAnalytics } from '../../../../../Utilities/analytics';

type CreateDropdownProps = {
  getBlueprintPayload: () => Promise<
    '' | CreateBlueprintRequest | CockpitCreateBlueprintRequest | undefined
  >;
  setIsOpen: (isOpen: boolean) => void;
  isDisabled: boolean;
};

export const CreateSaveAndBuildBtn = ({
  getBlueprintPayload,
  setIsOpen,
  isDisabled,
}: CreateDropdownProps) => {
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

  const { trigger: buildBlueprint } = useComposeBlueprintMutation();
  const { trigger: createBlueprint } = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });
  const dispatch = useAppDispatch();
  const onSaveAndBuild = async () => {
    const requestBody = await getBlueprintPayload();
    setIsOpen(false);

    if (!process.env.IS_ON_PREMISE && requestBody) {
      const analyticsData = createAnalytics(
        requestBody as CreateBlueprintRequest,
        packages,
        isBeta,
      );
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Blueprint Created`, {
        ...analyticsData,
        type: 'createBlueprintAndBuildImages',
        account_id: userData?.identity.internal?.account_id || 'Not found',
      });
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Requested`, {
        module: AMPLITUDE_MODULE_NAME,
        trigger: 'blueprint_created',
        image_request_types: requestBody.image_requests.map(
          (req) => req.image_type,
        ),
      });
    }
    if (requestBody) {
      const blueprint = (await createBlueprint({
        createBlueprintRequest: requestBody,
      })) as CreateBlueprintResponse;

      buildBlueprint({ id: blueprint.id, body: {} });
      dispatch(setBlueprintId(blueprint.id));
    }
  };

  return (
    <DropdownList>
      <DropdownItem onClick={onSaveAndBuild} isDisabled={isDisabled}>
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
  const { analytics, auth, isBeta } = useChrome();
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);

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

  const { trigger: createBlueprint, isLoading } = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const wasModalSeen = window.localStorage.getItem(
    'imageBuilder.saveAndBuildModalSeen',
  );

  const SaveAndBuildImagesModal = () => {
    const handleClose = () => {
      setShowModal(false);
    };

    return (
      <Modal isOpen={showModal} onClose={handleClose} width='50%'>
        <ModalHeader title='Save time by building images' />
        <ModalBody>
          Building blueprints and images doesn&apos;t need to be a two step
          process. To build images simultaneously, use the dropdown arrow to the
          right side of this button.
        </ModalBody>
        <ModalFooter>
          <Button
            key='back'
            variant='primary'
            data-testid='close-button-saveandbuild-modal'
            onClick={handleClose}
          >
            Close
          </Button>
        </ModalFooter>
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

    if (!process.env.IS_ON_PREMISE && requestBody) {
      const analyticsData = createAnalytics(
        requestBody as CreateBlueprintRequest,
        packages,
        isBeta,
      );
      analytics.track(`${AMPLITUDE_MODULE_NAME} - Blueprint Created`, {
        ...analyticsData,
        type: 'createBlueprint',
        account_id: userData?.identity.internal?.account_id || 'Not found',
      });
    }
    if (requestBody) {
      const blueprint = (await createBlueprint({
        createBlueprintRequest: requestBody,
      })) as CreateBlueprintResponse;
      dispatch(setBlueprintId(blueprint.id));
    }
  };

  return (
    <>
      {showModal && <SaveAndBuildImagesModal />}
      <MenuToggleAction
        onClick={onClick}
        id='wizard-create-save-btn'
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
          <FlexItem>Create blueprint</FlexItem>
        </Flex>
      </MenuToggleAction>
    </>
  );
};
