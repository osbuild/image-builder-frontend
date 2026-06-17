import React from 'react';

import { Alert, AlertActionLink } from '@patternfly/react-core';

type BlueprintVersionAlertProps = {
  selectedBlueprintVersion: number | undefined;
  latestImageVersion: number | null | undefined;
  setShowDiffModal: (value: boolean) => void;
};

const BlueprintVersionAlert = ({
  selectedBlueprintVersion,
  latestImageVersion,
  setShowDiffModal,
}: BlueprintVersionAlertProps) => {
  return (
    <Alert
      style={{
        margin:
          '0 var(--pf-v6-c-toolbar__content--PaddingRight) 0 var(--pf-v6-c-toolbar__content--PaddingLeft)',
      }}
      isInline
      title={`The selected blueprint is at version ${selectedBlueprintVersion}, the latest images are at version ${latestImageVersion}. Build images to synchronize with the latest version.`}
      actionLinks={
        <AlertActionLink
          onClick={() => setShowDiffModal(true)}
          id='blueprint_view_version_difference'
        >
          View the difference
        </AlertActionLink>
      }
    />
  );
};

export default BlueprintVersionAlert;
