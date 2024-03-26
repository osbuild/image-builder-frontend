import React from 'react';

import {
  ActionGroup,
  Button,
  DropEvent,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

interface ImportBlueprintModalProps {
  setShowImportModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

export const ImportBlueprintModal: React.FunctionComponent<
  ImportBlueprintModalProps
> = ({ setShowImportModal, isOpen }: ImportBlueprintModalProps) => {
  const onImportClose = () => {
    setShowImportModal(false);
  };
  const [jsonContent, setJsonContent] = React.useState('');
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);

  const handleFileInputChange = (
    _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    file: File
  ) => {
    setFilename(file.name);
    setIsRejected(false);
  };
  const handleClear = () => {
    setFilename('');
    setJsonContent('');
    setIsRejected(false);
  };
  const handleTextChange = (
    _: React.ChangeEvent<HTMLTextAreaElement>,
    value: string
  ) => {
    setJsonContent(value);
  };
  const handleDataChange = (_: DropEvent, value: string) => {
    setJsonContent(value);
  };
  const handleFileRejected = () => {
    setIsRejected(true);
  };
  const handleFileReadStarted = () => {
    setIsLoading(true);
  };
  const handleFileReadFinished = () => {
    setIsLoading(false);
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      title={'Import pipeline'}
      onClose={onImportClose}
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
            allowEditingUploadedText={false}
            browseButtonText="Upload"
            dropzoneProps={{
              accept: { 'text/json': ['.json'] },
              maxSize: 1024,
              onDropRejected: handleFileRejected,
            }}
            validated={isRejected ? 'error' : 'default'}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={isRejected ? 'error' : 'default'}>
                {isRejected
                  ? 'Must be a JSON file no larger than 1 KB'
                  : 'Upload a JSON file'}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      </Form>
      <ActionGroup>
        <Button type="button">Review and finish</Button>
        <Button variant="link" type="button" onClick={onImportClose}>
          Cancel
        </Button>
      </ActionGroup>
    </Modal>
  );
};
