import React, { useEffect, useState } from 'react';

import {
  Button,
  Dropdown,
  Flex,
  MenuToggle,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import { MenuToggleElement } from '@patternfly/react-core/dist/esm/components/MenuToggle/MenuToggle';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useStore } from 'react-redux';

import { selectSelectedBlueprintId } from '@/store/slices/blueprint';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectOrgId } from '@/store/slices/wizard';
import { selectWizardModalMode } from '@/store/slices/wizardModal';

import {
  useCreateBPWithNotification as useCreateBlueprintMutation,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../Hooks';
import { useAppSelector } from '../../../store/hooks';
import {
  CreateSaveAndBuildBtn,
  CreateSaveButton,
} from '../../CreateImageWizard/steps/Review/Footer/CreateDropdown';
import {
  EditSaveAndBuildBtn,
  EditSaveButton,
} from '../../CreateImageWizard/steps/Review/Footer/EditDropdown';
import { mapRequestFromState } from '../../CreateImageWizard/utilities/requestMapper';
import { useIsBlueprintValid } from '../../CreateImageWizard/utilities/useValidation';

const ReviewWizardFooter = () => {
  const { goToPrevStep, close } = useWizardContext();
  const { isSuccess: isCreateSuccess, reset: resetCreate } =
    useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  const { isSuccess: isUpdateSuccess, reset: resetUpdate } =
    useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const { auth } = useChrome();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const mode = useAppSelector(selectWizardModalMode);
  const blueprintId = useAppSelector(selectSelectedBlueprintId);
  const [isOpen, setIsOpen] = useState(false);
  const store = useStore();
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };
  const isValid = useIsBlueprintValid();
  const orgId = useAppSelector(selectOrgId);

  useEffect(() => {
    if (isUpdateSuccess || isCreateSuccess) {
      resetCreate();
      resetUpdate();
      close();
    }
  }, [isUpdateSuccess, isCreateSuccess, resetCreate, resetUpdate, close]);

  const getBlueprintPayload = async () => {
    if (!isOnPremise) {
      const userData = await auth.getUser();
      const orgId = userData?.identity.internal?.org_id;
      const requestBody = orgId && mapRequestFromState(store, orgId);
      return requestBody;
    }

    return mapRequestFromState(store, orgId ?? '');
  };

  const isEditMode = mode === 'edit';

  return (
    <WizardFooterWrapper>
      <Flex
        columnGap={{ default: 'columnGapSm' }}
        justifyContent={{ default: 'justifyContentFlexEnd' }}
      >
        <Dropdown
          isOpen={isOpen}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              variant='primary'
              ref={toggleRef}
              onClick={onToggleClick}
              isExpanded={isOpen}
              isDisabled={!isValid}
              splitButtonItems={
                isEditMode
                  ? [
                      <EditSaveButton
                        key='wizard-edit-save-btn'
                        getBlueprintPayload={getBlueprintPayload}
                        setIsOpen={setIsOpen}
                        blueprintId={blueprintId || ''}
                        isDisabled={!isValid}
                      />,
                    ]
                  : [
                      <CreateSaveButton
                        key='wizard-create-save-btn'
                        getBlueprintPayload={getBlueprintPayload}
                        setIsOpen={setIsOpen}
                        isDisabled={!isValid}
                      />,
                    ]
              }
            />
          )}
          onSelect={() => setIsOpen(false)}
        >
          {isEditMode ? (
            <EditSaveAndBuildBtn
              getBlueprintPayload={getBlueprintPayload}
              blueprintId={blueprintId || ''}
              setIsOpen={setIsOpen}
              isDisabled={!isValid}
            />
          ) : (
            <CreateSaveAndBuildBtn
              getBlueprintPayload={getBlueprintPayload}
              setIsOpen={setIsOpen}
              isDisabled={!isValid}
            />
          )}
        </Dropdown>
        <Button variant='secondary' onClick={goToPrevStep}>
          Back
        </Button>
        <Button variant='link' onClick={close}>
          Cancel
        </Button>
      </Flex>
    </WizardFooterWrapper>
  );
};

export default ReviewWizardFooter;
