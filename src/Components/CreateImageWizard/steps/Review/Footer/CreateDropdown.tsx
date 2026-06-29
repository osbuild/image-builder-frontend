import React, { useState } from 'react';

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

import {
  CreateBlueprintRequest,
  CreateBlueprintResponse,
} from '@/store/api/backend';
import {
  useAppDispatch,
  useAppSelector,
  // store.getState() in click handlers to build request body
  // eslint-disable-next-line no-restricted-syntax
  useAppStore,
} from '@/store/hooks';
import { setBlueprintId } from '@/store/slices/blueprint';
import { selectIsOnPremise } from '@/store/slices/env';
import { mapStateToRequest, selectPackages } from '@/store/slices/wizard';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import {
  useComposeBPWithNotification as useComposeBlueprintMutation,
  useCreateBPWithNotification as useCreateBlueprintMutation,
  useGetUser,
} from '../../../../../Hooks';
import { createAnalytics } from '../../../../../Utilities/analytics';

type CreateDropdownProps = {
  setIsOpen: (isOpen: boolean) => void;
  isDisabled: boolean;
};

export const CreateSaveAndBuildBtn = ({
  setIsOpen,
  isDisabled,
}: CreateDropdownProps) => {
  const { analytics, auth, isBeta } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const packages = useAppSelector(selectPackages);
  const store = useAppStore();

  const { trigger: buildBlueprint } = useComposeBlueprintMutation();
  const { trigger: createBlueprint } = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });
  const dispatch = useAppDispatch();
  const onSaveAndBuild = async () => {
    const requestBody = mapStateToRequest(store.getState());
    setIsOpen(false);

    if (!isOnPremise) {
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
    const blueprint = (await createBlueprint({
      createBlueprintRequest: requestBody as CreateBlueprintRequest,
    })) as CreateBlueprintResponse;

    buildBlueprint({ id: blueprint.id, body: {} });
    dispatch(setBlueprintId(blueprint.id));
  };

  return (
    <DropdownList>
      <DropdownItem onClick={onSaveAndBuild} isDisabled={isDisabled}>
        Create blueprint and build image(s)
      </DropdownItem>
    </DropdownList>
  );
};

type SaveAndBuildImagesModalProps = {
  showModal: boolean;
  handleClose: () => void;
};

const SaveAndBuildImagesModal = ({
  showModal,
  handleClose,
}: SaveAndBuildImagesModalProps) => {
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

export const CreateSaveButton = ({
  setIsOpen,
  isDisabled,
}: CreateDropdownProps) => {
  const { analytics, auth, isBeta } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const packages = useAppSelector(selectPackages);
  const store = useAppStore();

  const { trigger: createBlueprint, isLoading } = useCreateBlueprintMutation({
    fixedCacheKey: 'createBlueprintKey',
  });
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const wasModalSeen = window.localStorage.getItem(
    'imageBuilder.saveAndBuildModalSeen',
  );

  const handleClose = () => {
    setShowModal(false);
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
    const requestBody = mapStateToRequest(store.getState());
    setIsOpen(false);

    if (!isOnPremise) {
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
    const blueprint = (await createBlueprint({
      createBlueprintRequest: requestBody as CreateBlueprintRequest,
    })) as CreateBlueprintResponse;
    dispatch(setBlueprintId(blueprint.id));
  };

  return (
    <>
      <SaveAndBuildImagesModal
        showModal={showModal}
        handleClose={handleClose}
      />
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
          <FlexItem>Create blueprint</FlexItem>
        </Flex>
      </MenuToggleAction>
    </>
  );
};
