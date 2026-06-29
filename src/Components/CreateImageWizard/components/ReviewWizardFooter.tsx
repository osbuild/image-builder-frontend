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
import { useIsBlueprintValid } from '../utilities/useValidation';

const ReviewWizardFooter = () => {
  const { goToPrevStep, close } = useWizardContext();
  const { isSuccess: isCreateSuccess, reset: resetCreate } =
    useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  const { isSuccess: isUpdateSuccess, reset: resetUpdate } =
    useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const mode = useAppSelector(selectWizardModalMode);
  const blueprintId = useAppSelector(selectSelectedBlueprintId);
  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };
  const isValid = useIsBlueprintValid();

  useEffect(() => {
    if (isUpdateSuccess || isCreateSuccess) {
      resetCreate();
      resetUpdate();
      close();
    }
  }, [isUpdateSuccess, isCreateSuccess, resetCreate, resetUpdate, close]);

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
              isDisabled={!isValid}
              splitButtonItems={
                isEditMode
                  ? [
                      <EditSaveButton
                        key='wizard-edit-save-btn'
                        setIsOpen={setIsOpen}
                        blueprintId={blueprintId || ''}
                        isDisabled={!isValid}
                      />,
                    ]
                  : [
                      <CreateSaveButton
                        key='wizard-create-save-btn'
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
              blueprintId={blueprintId || ''}
              setIsOpen={setIsOpen}
              isDisabled={!isValid}
            />
          ) : (
            <CreateSaveAndBuildBtn
              setIsOpen={setIsOpen}
              isDisabled={!isValid}
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
