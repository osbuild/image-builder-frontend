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
import { useNavigate, useParams } from 'react-router-dom';

import { CreateSaveAndBuildBtn, CreateSaveButton } from './CreateDropdown';
import { EditSaveAndBuildBtn, EditSaveButton } from './EditDropdown';

import {
  useCreateBPWithNotification as useCreateBlueprintMutation,
  useUpdateBPWithNotification as useUpdateBlueprintMutation,
} from '../../../../../Hooks';
import { resolveRelPath } from '../../../../../Utilities/path';
import { mapRequestFromState } from '../../../utilities/requestMapper';
import { useIsBlueprintValid } from '../../../utilities/useValidation';

const ReviewWizardFooter = () => {
  const { goToPrevStep, close } = useWizardContext();
  const { isSuccess: isCreateSuccess, reset: resetCreate } =
    useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  // initialize the server store with the data from RTK query
  const { isSuccess: isUpdateSuccess, reset: resetUpdate } =
    useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const { auth } = useChrome();
  const { composeId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const store = useStore();
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();
  const isValid = useIsBlueprintValid();

  useEffect(() => {
    if (isUpdateSuccess || isCreateSuccess) {
      resetCreate();
      resetUpdate();
      navigate(resolveRelPath(''));
    }
  }, [isUpdateSuccess, isCreateSuccess, resetCreate, resetUpdate, navigate]);

  const getBlueprintPayload = async () => {
    if (!process.env.IS_ON_PREMISE) {
      const userData = await auth.getUser();
      const orgId = userData?.identity?.internal?.org_id;
      const requestBody = orgId && mapRequestFromState(store, orgId);
      return requestBody;
    }

    // NOTE: This should be fine on-prem, we should
    // be able to ignore the `org-id`
    return mapRequestFromState(store, '');
  };

  return (
    <WizardFooterWrapper>
      <Flex columnGap={{ default: 'columnGapSm' }}>
        <Dropdown
          isOpen={isOpen}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              variant="primary"
              ref={toggleRef}
              onClick={onToggleClick}
              isExpanded={isOpen}
              isDisabled={!isValid}
              splitButtonItems={
                composeId
                  ? [
                      <EditSaveButton
                        key="wizard-edit-save-btn"
                        getBlueprintPayload={getBlueprintPayload}
                        setIsOpen={setIsOpen}
                        blueprintId={composeId}
                        isDisabled={!isValid}
                      />,
                    ]
                  : [
                      <CreateSaveButton
                        key="wizard-create-save-btn"
                        getBlueprintPayload={getBlueprintPayload}
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
              getBlueprintPayload={getBlueprintPayload}
              setIsOpen={setIsOpen}
              blueprintId={composeId}
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
        <Button variant="secondary" onClick={goToPrevStep}>
          Back
        </Button>
        <Button variant="link" onClick={close}>
          Cancel
        </Button>
      </Flex>
    </WizardFooterWrapper>
  );
};

export default ReviewWizardFooter;
