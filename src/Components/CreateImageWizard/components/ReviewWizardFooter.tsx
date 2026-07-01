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
import { flushSync } from 'react-dom';
import { useStore } from 'react-redux';

import { selectSelectedBlueprintId } from '@/store/slices/blueprint';
import { selectWizardModalMode } from '@/store/slices/wizardModal';

import {
  useCreateBPWithNotification as useCreateBlueprintMutation,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../Hooks';
import { useAppSelector } from '../../../store/hooks';
import {
  CreateSaveAndBuildBtn,
  CreateSaveButton,
} from '../steps/Review/Footer/CreateDropdown';
import {
  EditSaveAndBuildBtn,
  EditSaveButton,
} from '../steps/Review/Footer/EditDropdown';
import { mapRequestFromState } from '../utilities/requestMapper';
import { scrollToFirstError } from '../utilities/scrollToFirstError';
import { useBlueprintValidation } from '../utilities/useValidation';
import { useValidationContext } from '../utilities/ValidationContext';

const ReviewWizardFooter = () => {
  const { goToPrevStep, goToStepById, close } = useWizardContext();
  const { setForceShowErrors } = useValidationContext();
  const { isSuccess: isCreateSuccess, reset: resetCreate } =
    useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  const { isSuccess: isUpdateSuccess, reset: resetUpdate } =
    useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const mode = useAppSelector(selectWizardModalMode);
  const blueprintId = useAppSelector(selectSelectedBlueprintId);
  const [isOpen, setIsOpen] = useState(false);
  const store = useStore();
  const { isValid, firstErrorStepId } = useBlueprintValidation();

  const handleValidationFail = () => {
    if (!firstErrorStepId) return;
    flushSync(() => {
      setForceShowErrors();
    });
    goToStepById(firstErrorStepId);
    requestAnimationFrame(() => {
      scrollToFirstError();
    });
  };

  const onToggleClick = () => {
    if (!isValid) {
      handleValidationFail();
      return;
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isUpdateSuccess || isCreateSuccess) {
      resetCreate();
      resetUpdate();
      close();
    }
  }, [isUpdateSuccess, isCreateSuccess, resetCreate, resetUpdate, close]);

  const onBeforeAction = (): boolean => {
    if (!isValid) {
      handleValidationFail();
      return false;
    }
    return true;
  };

  const getBlueprintPayload = () => {
    return mapRequestFromState(store);
  };

  const isEditMode = mode === 'edit';

  return (
    <WizardFooterWrapper>
      <Flex
        columnGap={{ default: 'columnGapSm' }}
        justifyContent={{ default: 'justifyContentFlexEnd' }}
      >
        <Button variant='secondary' onClick={goToPrevStep}>
          Back
        </Button>
        <Dropdown
          isOpen={isOpen}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              variant='primary'
              ref={toggleRef}
              onClick={onToggleClick}
              isExpanded={isOpen}
              splitButtonItems={
                isEditMode
                  ? [
                      <EditSaveButton
                        key='wizard-edit-save-btn'
                        getBlueprintPayload={getBlueprintPayload}
                        setIsOpen={setIsOpen}
                        blueprintId={blueprintId || ''}
                        isDisabled={!isValid}
                        onBeforeAction={onBeforeAction}
                      />,
                    ]
                  : [
                      <CreateSaveButton
                        key='wizard-create-save-btn'
                        getBlueprintPayload={getBlueprintPayload}
                        setIsOpen={setIsOpen}
                        isDisabled={!isValid}
                        onBeforeAction={onBeforeAction}
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
              onBeforeAction={onBeforeAction}
            />
          ) : (
            <CreateSaveAndBuildBtn
              getBlueprintPayload={getBlueprintPayload}
              setIsOpen={setIsOpen}
              isDisabled={!isValid}
              onBeforeAction={onBeforeAction}
            />
          )}
        </Dropdown>
        <Button variant='link' onClick={close}>
          Cancel
        </Button>
      </Flex>
    </WizardFooterWrapper>
  );
};

export default ReviewWizardFooter;
