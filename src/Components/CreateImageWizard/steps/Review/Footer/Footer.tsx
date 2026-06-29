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
import { useNavigate, useParams } from 'react-router-dom';

import { selectPathResolver } from '@/store/slices/env';

import { CreateSaveAndBuildBtn, CreateSaveButton } from './CreateDropdown';
import { EditSaveAndBuildBtn, EditSaveButton } from './EditDropdown';

import {
  useCreateBPWithNotification as useCreateBlueprintMutation,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../../../Hooks';
import { useAppSelector } from '../../../../../store/hooks';
import { useIsBlueprintValid } from '../../../utilities/useValidation';

const ReviewWizardFooter = () => {
  const { goToPrevStep, close } = useWizardContext();
  const { isSuccess: isCreateSuccess, reset: resetCreate } =
    useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  // initialize the server store with the data from RTK query
  const { isSuccess: isUpdateSuccess, reset: resetUpdate } =
    useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const resolvePath = useAppSelector(selectPathResolver);
  const { composeId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();
  const isValid = useIsBlueprintValid();

  useEffect(() => {
    if (isUpdateSuccess || isCreateSuccess) {
      resetCreate();
      resetUpdate();
      navigate(resolvePath(''));
    }
  }, [isUpdateSuccess, isCreateSuccess, resetCreate, resetUpdate, navigate]);

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
              isDisabled={!isValid}
              splitButtonItems={
                composeId
                  ? [
                      <EditSaveButton
                        key='wizard-edit-save-btn'
                        setIsOpen={setIsOpen}
                        blueprintId={composeId}
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
          shouldFocusToggleOnSelect
        >
          {composeId ? (
            <EditSaveAndBuildBtn
              setIsOpen={setIsOpen}
              blueprintId={composeId}
              isDisabled={!isValid}
            />
          ) : (
            <CreateSaveAndBuildBtn
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
