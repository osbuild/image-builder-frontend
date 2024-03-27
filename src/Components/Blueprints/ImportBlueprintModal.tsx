import React, { ChangeEvent } from 'react';

import {
  ActionGroup,
  Alert,
  AlertActionLink,
  Button,
  DropEvent,
  FileUpload,
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

  const handleFileInputChange = (
    _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    file: File
  ) => {
    setFilename(file.name);
  };
  const handleClear = () => {
    setFilename('');
    setJsonContent('');
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      title={'Import pipeline'}
      onClose={onImportClose}
    >
      {false && (
        <Alert
          variant="info"
          title="For expected file format, refer to documentation"
          ouiaId="InfoAlert"
        >
          <AlertActionLink component="a" href="#">
            View documentation
          </AlertActionLink>
        </Alert>
      )}
      <FileUpload
        id="import-blueprint-file-upload"
        type="text"
        value={jsonContent}
        filename={filename}
        filenamePlaceholder="Drag and drop a file or upload one"
        onFileInputChange={handleFileInputChange}
        onDataChange={(_: DropEvent, value: string) => {
          setJsonContent(value);
        }}
        onTextChange={(_: ChangeEvent<HTMLTextAreaElement>, value: string) => {
          setJsonContent(value);
        }}
        onReadStarted={() => setIsLoading(true)}
        onReadFinished={() => setIsLoading(false)}
        onClearClick={handleClear}
        isLoading={isLoading}
        allowEditingUploadedText={false}
        browseButtonText="Upload"
      />
      <ActionGroup>
        <Button type="button">Review and finish</Button>
        <Button variant="link" type="button" onClick={onImportClose}>
          Cancel
        </Button>
      </ActionGroup>
    </Modal>
  );
};
