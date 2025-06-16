import React from 'react';

import { DiffEditor } from '@monaco-editor/react';
import {
  Button,
  Modal,
  ModalVariant,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

import { BuildImagesButton } from './BuildImagesButton';

import { useGetBlueprintQuery } from '../../store/backendApi';
import { selectSelectedBlueprintId } from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';

type blueprintDiffProps = {
  // baseVersion is the version of the blueprint to compare the latest version against
  baseVersion: number | null | undefined;
  blueprintName: string | undefined;
  isOpen: boolean;
  onClose?: () => void;
};

const BlueprintDiffModal = ({
  baseVersion,
  blueprintName,
  isOpen,
  onClose,
}: blueprintDiffProps) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);

  const { data: baseBlueprint } = useGetBlueprintQuery(
    { id: selectedBlueprintId as string, version: baseVersion || -1 },
    { skip: !selectedBlueprintId || !baseVersion }
  );
  const { data: blueprint } = useGetBlueprintQuery(
    { id: selectedBlueprintId as string },
    { skip: !selectedBlueprintId }
  );

  if (!baseBlueprint || !blueprint) {
    return null;
  }

  return (
    <Modal variant={ModalVariant.large} isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={`Compare ${blueprintName || ''} versions`}
        titleIconVariant={'info'}
      />
      <ModalBody>
        <DiffEditor
          height="90vh"
          language="json"
          original={JSON.stringify(baseBlueprint, undefined, 2)}
          modified={JSON.stringify(blueprint, undefined, 2)}
        />
      </ModalBody>
      <ModalFooter>
        <BuildImagesButton key="build-button">
          Synchronize images
        </BuildImagesButton>
        <Button
          key="cancel-button"
          variant="link"
          type="button"
          onClick={onClose}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BlueprintDiffModal;
