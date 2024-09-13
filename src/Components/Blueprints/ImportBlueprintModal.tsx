import React from 'react';

import {
  ActionGroup,
  Button,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { DropEvent } from '@patternfly/react-core/dist/esm/helpers';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../store/hooks';
import { BlueprintExportResponse } from '../../store/imageBuilderApi';
import { wizardState } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import { mapExportRequestToState } from '../CreateImageWizard/utilities/requestMapper';

interface ImportBlueprintModalProps {
  setShowImportModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

export const ImportBlueprintModal: React.FunctionComponent<
  ImportBlueprintModalProps
> = ({ setShowImportModal, isOpen }: ImportBlueprintModalProps) => {
  const onImportClose = () => {
    setShowImportModal(false);
    setFilename('');
    setJsonContent('');
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const [jsonContent, setJsonContent] = React.useState('');
  const [importedBlueprint, setImportedBlueprint] =
    React.useState<wizardState>();
  const [isInvalidFormat, setIsInvalidFormat] = React.useState(false);
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const dispatch = useAppDispatch();

  const handleFileInputChange = (
    _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    file: File
  ) => {
    setFilename(file.name);
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const handleClear = () => {
    setFilename('');
    setJsonContent('');
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const handleTextChange = (
    _: React.ChangeEvent<HTMLTextAreaElement>,
    value: string
  ) => {
    setJsonContent(value);
  };
  const handleDataChange = (_: DropEvent, value: string) => {
    try {
      const blueprintFromFile = JSON.parse(value);
      const customizations = blueprintFromFile.customizations;
      const blueprintExportedResponse: BlueprintExportResponse = {
        name: blueprintFromFile.name,
        description: blueprintFromFile.description,
        distribution: blueprintFromFile.distribution,
        customizations: customizations,
        metadata: blueprintFromFile.metadata,
      };
      const isSubscriptionPresent =
        customizations && 'subscription' in customizations;
      const importBlueprintState = mapExportRequestToState(
        blueprintExportedResponse,
        blueprintFromFile.image_requests || [],
        isSubscriptionPresent
      );
      setImportedBlueprint(importBlueprintState);
      setJsonContent(value);
    } catch (error) {
      setIsInvalidFormat(true);
      dispatch(
        addNotification({
          variant: 'warning',
          title: 'No blueprint was build',
          description: error?.data?.error?.message,
        })
      );
    }
  };
  const handleFileRejected = () => {
    setIsRejected(true);
    setJsonContent('');
    setFilename('');
  };
  const handleFileReadStarted = () => {
    setIsLoading(true);
  };
  const handleFileReadFinished = () => {
    setIsLoading(false);
  };
  const navigate = useNavigate();

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      title={'Import pipeline'}
      onClose={onImportClose}
      ouiaId="import-blueprint-modal"
    >
      <Form>
        <FormGroup fieldId="import-blueprint-file-upload">
          <FileUpload
            id="import-blueprint-file-upload"
            type="text"
            value={jsonContent}
            filename={filename}
            filenamePlaceholder="Drag and drop a file or upload one"
            onFileInputChange={handleFileInputChange}
            onDataChange={handleDataChange}
            onTextChange={handleTextChange}
            onReadStarted={handleFileReadStarted}
            onReadFinished={handleFileReadFinished}
            onClearClick={handleClear}
            isLoading={isLoading}
            isReadOnly={true}
            browseButtonText="Upload"
            dropzoneProps={{
              accept: { 'text/json': ['.json'] },
              maxSize: 25000,
              onDropRejected: handleFileRejected,
            }}
            validated={isRejected || isInvalidFormat ? 'error' : 'default'}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={isRejected ? 'error' : 'default'}>
                {isRejected
                  ? 'Must be a valid Blueprint JSON file no larger than 25 KB'
                  : isInvalidFormat
                  ? 'Not compatible with the blueprints format.'
                  : 'Upload a JSON file'}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
        <ActionGroup>
          <Button
            type="button"
            isDisabled={isRejected || isInvalidFormat || !jsonContent}
            onClick={() =>
              navigate(resolveRelPath(`imagewizard/import`), {
                state: { blueprint: importedBlueprint },
              })
            }
            ouiaId="import-blueprint-finish"
            data-testid="import-blueprint-finish"
          >
            Review and finish
          </Button>
          <Button variant="link" type="button" onClick={onImportClose}>
            Cancel
          </Button>
        </ActionGroup>
      </Form>
    </Modal>
  );
};
