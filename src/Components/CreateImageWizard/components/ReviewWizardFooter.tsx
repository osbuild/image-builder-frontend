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

import { selectSelectedBlueprintId } from '@/store/slices/blueprint';
import { selectWizardModalMode } from '@/store/slices/wizardModal';

import {
  useCreateBPWithNotification as useCreateBlueprintMutation,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../Hooks';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  resetForceShowErrors,
  setForceShowErrors,
} from '../../../store/slices/wizard';
import {
  CreateSaveAndBuildBtn,
  CreateSaveButton,
} from '../steps/Review/Footer/CreateDropdown';
import {
  EditSaveAndBuildBtn,
  EditSaveButton,
} from '../steps/Review/Footer/EditDropdown';
import { scrollToFirstError } from '../utilities/scrollToFirstError';
import { useBlueprintValidation } from '../utilities/useValidation';

const ReviewWizardFooter = () => {
  const { goToPrevStep, goToStepById, close } = useWizardContext();
  const dispatch = useAppDispatch();
  const { isSuccess: isCreateSuccess, reset: resetCreate } =
    useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  const { isSuccess: isUpdateSuccess, reset: resetUpdate } =
    useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const mode = useAppSelector(selectWizardModalMode);
  const blueprintId = useAppSelector(selectSelectedBlueprintId);
  const [isOpen, setIsOpen] = useState(false);
  const { isValid, firstErrorStepId } = useBlueprintValidation();

  const handleValidationFail = () => {
    if (!firstErrorStepId) return;
    flushSync(() => {
      dispatch(setForceShowErrors());
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

  const validateBeforeAction = (): boolean => {
    if (!isValid) {
      handleValidationFail();
      return false;
    }
    return true;
  };

  const isEditMode = mode === 'edit';

  return (
    <WizardFooterWrapper>
      <Flex
        columnGap={{ default: 'columnGapSm' }}
        justifyContent={{ default: 'justifyContentFlexEnd' }}
      >
        <Button
          variant='secondary'
          onClick={() => {
            dispatch(resetForceShowErrors());
            goToPrevStep();
          }}
        >
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
                        setIsOpen={setIsOpen}
                        blueprintId={blueprintId || ''}
                        isDisabled={!isValid}
                        validateBeforeAction={validateBeforeAction}
                      />,
                    ]
                  : [
                      <CreateSaveButton
                        key='wizard-create-save-btn'
                        setIsOpen={setIsOpen}
                        isDisabled={!isValid}
                        validateBeforeAction={validateBeforeAction}
                      />,
                    ]
              }
            />
          )}
          onSelect={() => setIsOpen(false)}
        >
          {isEditMode ? (
            <EditSaveAndBuildBtn
              blueprintId={blueprintId || ''}
              setIsOpen={setIsOpen}
              isDisabled={!isValid}
              validateBeforeAction={validateBeforeAction}
            />
          ) : (
            <CreateSaveAndBuildBtn
              setIsOpen={setIsOpen}
              isDisabled={!isValid}
              validateBeforeAction={validateBeforeAction}
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
