import React, { useState, useEffect } from 'react';

import {
  Button,
  Dropdown,
  MenuToggle,
  MenuToggleElement,
  WizardFooterWrapper,
  useWizardContext,
} from '@patternfly/react-core';
import { SpinnerIcon } from '@patternfly/react-icons';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useStore } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import CreateDropdown from './CreateDropdown';
import EditDropdown from './EditDropdown';

import { useServerStore } from '../../../../../store/hooks';
import {
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
} from '../../../../../store/imageBuilderApi';
import { resolveRelPath } from '../../../../../Utilities/path';
import { mapRequestFromState } from '../../../utilities/requestMapper';

const ReviewWizardFooter = () => {
  const { goToPrevStep, close } = useWizardContext();
  const [
    ,
    {
      isLoading: isCreationLoading,
      isSuccess: isCreateSuccess,
      reset: resetCreate,
    },
  ] = useCreateBlueprintMutation({ fixedCacheKey: 'createBlueprintKey' });

  // initialize the server store with the data from RTK query
  const serverStore = useServerStore();
  const [
    ,
    {
      isLoading: isUpdateLoading,
      isSuccess: isUpdateSuccess,
      reset: resetUpdate,
    },
  ] = useUpdateBlueprintMutation({ fixedCacheKey: 'updateBlueprintKey' });
  const { auth } = useChrome();
  const { composeId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const store = useStore();
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (isUpdateSuccess || isCreateSuccess) {
      resetCreate();
      resetUpdate();
      navigate(resolveRelPath(''));
    }
  }, [isUpdateSuccess, isCreateSuccess, resetCreate, resetUpdate, navigate]);

  const getBlueprintPayload = async () => {
    const userData = await auth?.getUser();
    const orgId = userData?.identity?.internal?.org_id;
    const requestBody = orgId && mapRequestFromState(store, orgId, serverStore);
    return requestBody;
  };

  const isLoadingState = isCreationLoading || isUpdateLoading;

  return (
    <WizardFooterWrapper>
      <div data-testid="wizard-save-button-div">
        <Dropdown
          isOpen={isOpen}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              variant="primary"
              ref={toggleRef}
              onClick={onToggleClick}
              isExpanded={isOpen}
              icon={isLoadingState && <SpinnerIcon />}
            >
              Save
            </MenuToggle>
          )}
          ouiaId="wizard-finish-dropdown"
          shouldFocusToggleOnSelect
        >
          {composeId ? (
            <EditDropdown
              getBlueprintPayload={getBlueprintPayload}
              setIsOpen={setIsOpen}
              blueprintId={composeId}
            />
          ) : (
            <CreateDropdown
              getBlueprintPayload={getBlueprintPayload}
              setIsOpen={setIsOpen}
            />
          )}
        </Dropdown>
      </div>
      <Button
        ouiaId="wizard-back-btn"
        variant="secondary"
        onClick={goToPrevStep}
      >
        Back
      </Button>
      <Button ouiaId="wizard-cancel-btn" variant="link" onClick={close}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

export default ReviewWizardFooter;
