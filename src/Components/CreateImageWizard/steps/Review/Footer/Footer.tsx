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
import { useNavigate, useParams } from 'react-router-dom';

import { selectPathResolver } from '@/store/slices/env';

import { CreateSaveAndBuildBtn, CreateSaveButton } from './CreateDropdown';
import { EditSaveAndBuildBtn, EditSaveButton } from './EditDropdown';

import {
  useCreateBPWithNotification as useCreateBlueprintMutation,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../../../Hooks';
import { useAppSelector } from '../../../../../store/hooks';
import { mapRequestFromState } from '../../../utilities/requestMapper';
import { scrollToFirstError } from '../../../utilities/scrollToFirstError';
import { useBlueprintValidation } from '../../../utilities/useValidation';
import { useValidationContext } from '../../../utilities/ValidationContext';

const ReviewWizardFooter = () => {
  const { goToPrevStep, goToStepById, close } = useWizardContext();
  const { setForceShowErrors } = useValidationContext();
  const { isSuccess: isCreateSuccess, reset: resetCreate } =
    useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  const { isSuccess: isUpdateSuccess, reset: resetUpdate } =
    useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const resolvePath = useAppSelector(selectPathResolver);
  const { composeId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const store = useStore();
  const navigate = useNavigate();
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
      navigate(resolvePath(''));
    }
  }, [isUpdateSuccess, isCreateSuccess, resetCreate, resetUpdate, navigate]);

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

  return (
    <WizardFooterWrapper>
      <Flex columnGap={{ default: 'columnGapSm' }}>
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
                composeId
                  ? [
                      <EditSaveButton
                        key='wizard-edit-save-btn'
                        getBlueprintPayload={getBlueprintPayload}
                        setIsOpen={setIsOpen}
                        blueprintId={composeId}
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
          shouldFocusToggleOnSelect
        >
          {composeId ? (
            <EditSaveAndBuildBtn
              getBlueprintPayload={getBlueprintPayload}
              setIsOpen={setIsOpen}
              blueprintId={composeId}
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
