import React, { useState, useEffect } from 'react';

import {
  Button,
  Dropdown,
  MenuToggle,
  WizardFooterWrapper,
  useWizardContext,
} from '@patternfly/react-core';
import { MenuToggleElement } from '@patternfly/react-core/dist/esm/components/MenuToggle/MenuToggle';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useStore } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { CreateSaveAndBuildBtn, CreateSaveButton } from './CreateDropdown';
import { EditSaveAndBuildBtn, EditSaveButton } from './EditDropdown';

import {
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
} from '../../../../../store/backendApi';
import { resolveRelPath } from '../../../../../Utilities/path';
import { useGetEnvironment } from '../../../../../Utilities/useGetEnvironment';
import { mapRequestFromState } from '../../../utilities/requestMapper';
import { useIsBlueprintValid } from '../../../utilities/useValidation';

const ReviewWizardFooter = () => {
  const { goToPrevStep, close } = useWizardContext();
  const [, { isSuccess: isCreateSuccess, reset: resetCreate }] =
    useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  // initialize the server store with the data from RTK query
  const [, { isSuccess: isUpdateSuccess, reset: resetUpdate }] =
    useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const { auth } = useChrome();
  const { composeId } = useParams();
  const { isFedoraEnv } = useGetEnvironment();
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
    if (!process.env.IS_ON_PREMISE && !isFedoraEnv) {
      const userData = await auth?.getUser();
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
            splitButtonOptions={{
              variant: 'action',
              items: composeId
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
                  ],
            }}
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
    </WizardFooterWrapper>
  );
};

export default ReviewWizardFooter;
