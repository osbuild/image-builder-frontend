import React from 'react';

import { parse } from '@ltd/j-toml';
import {
  ActionGroup,
  Button,
  Checkbox,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
} from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { DropEvent } from '@patternfly/react-core/dist/esm/helpers';
import { HelpIcon } from '@patternfly/react-icons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useNavigate } from 'react-router-dom';

import { mapOnPremToHosted } from './helpers/onPremToHostedBlueprintMapper';

import {
  ApiRepositoryImportResponseRead,
  ApiRepositoryRequest,
  useBulkImportRepositoriesMutation,
} from '../../store/contentSourcesApi';
import { useAppDispatch } from '../../store/hooks';
import {
  BlueprintExportResponse,
  BlueprintItem,
  CustomRepository,
} from '../../store/imageBuilderApi';
import { wizardState } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import {
  mapExportRequestToState,
  mapToCustomRepositories,
} from '../CreateImageWizard/utilities/requestMapper';

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
    setFileContent('');
    setIsOnPrem(false);
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const [fileContent, setFileContent] = React.useState('');
  const [importedBlueprint, setImportedBlueprint] =
    React.useState<wizardState>();
  const [isInvalidFormat, setIsInvalidFormat] = React.useState(false);
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const [isOnPrem, setIsOnPrem] = React.useState(false);
  const [isCheckedImportRepos, setIsCheckedImportRepos] = React.useState(true);
  const dispatch = useAppDispatch();
  const [importRepositories] = useBulkImportRepositoriesMutation();

  const handleFileInputChange = (
    _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    file: File
  ) => {
    setFileContent('');
    setFilename(file.name);
  };

  async function handleRepositoryImport(
    blueprintExportedResponse: BlueprintExportResponse
  ): Promise<CustomRepository[] | undefined> {
    if (isCheckedImportRepos && blueprintExportedResponse.content_sources) {
      const customRepositories: ApiRepositoryRequest[] =
        blueprintExportedResponse.content_sources.map(
          (item) => item as ApiRepositoryRequest
        );

      try {
        const result = await importRepositories({
          body: customRepositories,
        }).unwrap();
        if (Array.isArray(result)) {
          const importedRepositoryNames: string[] = [];
          const newCustomRepos: CustomRepository[] = [];
          result.forEach((repository) => {
            const contentSourcesRepo =
              repository as ApiRepositoryImportResponseRead;
            if (contentSourcesRepo.uuid) {
              newCustomRepos.push(
                ...mapToCustomRepositories(contentSourcesRepo)
              );
            }
            if (repository.warnings?.length === 0 && repository.url) {
              importedRepositoryNames.push(repository.url);
              return;
            }
            dispatch(
              addNotification({
                variant: 'warning',
                title: 'Failed to import custom repositories',
                description: JSON.stringify(repository.warnings),
              })
            );
          });

          if (importedRepositoryNames.length !== 0) {
            dispatch(
              addNotification({
                variant: 'info',
                title: 'Successfully imported custom repositories',
                description: importedRepositoryNames.join(', '),
              })
            );
          }
          return newCustomRepos;
        }
      } catch {
        dispatch(
          addNotification({
            variant: 'danger',
            title: 'Custom repositories import failed',
          })
        );
      }
    }
  }

  React.useEffect(() => {
    if (filename && fileContent) {
      const parseAndImport = async () => {
        try {
          const isToml = filename.endsWith('.toml');
          const isJson = filename.endsWith('.json');
          if (isToml) {
            const tomlBlueprint = parse(fileContent);
            const blueprintFromFile = mapOnPremToHosted(
              tomlBlueprint as BlueprintItem
            );
            const importBlueprintState = mapExportRequestToState(
              blueprintFromFile,
              []
            );
            setIsOnPrem(true);
            setImportedBlueprint(importBlueprintState);
          } else if (isJson) {
            const blueprintFromFile = JSON.parse(fileContent);
            let customRepos: CustomRepository[] = [];
            try {
              if (
                blueprintFromFile.content_sources &&
                blueprintFromFile.content_sources.length > 0
              ) {
                const imported = await handleRepositoryImport(
                  blueprintFromFile
                );
                customRepos = imported ?? [];
              }

              const blueprintExportedResponse: BlueprintExportResponse = {
                name: blueprintFromFile.name,
                description: blueprintFromFile.description,
                distribution: blueprintFromFile.distribution,
                customizations: blueprintFromFile.customizations,
                metadata: blueprintFromFile.metadata,
                content_sources: blueprintFromFile.content_sources,
              };
              blueprintExportedResponse.customizations.custom_repositories =
                customRepos;
              blueprintExportedResponse.customizations.payload_repositories =
                undefined;
              const importBlueprintState = mapExportRequestToState(
                blueprintExportedResponse,
                blueprintFromFile.image_requests || []
              );

              setIsOnPrem(false);
              setImportedBlueprint(importBlueprintState);
            } catch {
              const blueprintFromFileMapped =
                mapOnPremToHosted(blueprintFromFile);
              const importBlueprintState = mapExportRequestToState(
                blueprintFromFileMapped,
                []
              );
              setIsOnPrem(true);
              setImportedBlueprint(importBlueprintState);
            }
          }
        } catch (error) {
          setIsInvalidFormat(true);
          dispatch(
            addNotification({
              variant: 'warning',
              title: 'File is not a valid blueprint',
              description: error?.data?.error?.message,
            })
          );
        }
      };
      parseAndImport();
    }
  }, [filename, fileContent]);

  const handleClear = () => {
    setFilename('');
    setFileContent('');
    setIsOnPrem(false);
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const handleDataChange = (_: DropEvent, value: string) => {
    setFileContent(value);
  };
  const handleFileRejected = () => {
    setIsRejected(true);
    setIsOnPrem(false);
    setFileContent('');
    setFilename('');
  };
  const handleFileReadStarted = () => {
    setIsLoading(true);
  };
  const handleFileReadFinished = () => {
    setIsLoading(false);
  };
  const navigate = useNavigate();

  const variantSwitch = () => {
    switch (true) {
      case isRejected || isInvalidFormat:
        return 'error';
      case isOnPrem:
        return 'warning';
      default:
        return 'default';
    }
  };
  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      title={
        <>
          Import pipeline
          <Popover
            bodyContent={
              <div>
                You can import the blueprints you created by using the Red Hat
                image builder into Insights images to create customized images.
              </div>
            }
          >
            <Button
              icon={<HelpIcon />}
              variant="plain"
              aria-label="About import"
              className="pf-v6-u-pl-sm"
              isInline
            />
          </Popover>
        </>
      }
      onClose={onImportClose}
    >
      <Form>
        <FormGroup fieldId="checkbox-import-custom-repositories">
          <Checkbox
            label="Import missing custom repositories after file upload."
            isChecked={isCheckedImportRepos}
            onChange={() => setIsCheckedImportRepos((prev) => !prev)}
            aria-label="Import Custom Repositories checkbox"
            id="checkbox-import-custom-repositories"
            name="Import Repositories"
          />
        </FormGroup>
        <FormGroup fieldId="import-blueprint-file-upload">
          <FileUpload
            id="import-blueprint-file-upload"
            type="text"
            value={fileContent}
            filename={filename}
            filenamePlaceholder="Drag and drop a file or upload one"
            onFileInputChange={handleFileInputChange}
            onDataChange={handleDataChange}
            onReadStarted={handleFileReadStarted}
            onReadFinished={handleFileReadFinished}
            onClearClick={handleClear}
            isLoading={isLoading}
            isReadOnly={true}
            browseButtonText="Upload"
            dropzoneProps={{
              accept: { 'text/json': ['.json'], 'text/plain': ['.toml'] },
              maxSize: 512000,
              onDropRejected: handleFileRejected,
            }}
            validated={isRejected || isInvalidFormat ? 'error' : 'default'}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={variantSwitch()}>
                {isRejected
                  ? 'Must be a valid Blueprint JSON/TOML file no larger than 512 KB'
                  : isInvalidFormat
                  ? 'Not compatible with the blueprints format.'
                  : isOnPrem
                  ? 'Importing on-premises blueprints is currently in beta. Results may vary.'
                  : 'Upload your blueprint file. Supported formats: JSON, TOML.'}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
        <ActionGroup>
          <Button
            type="button"
            isDisabled={isRejected || isInvalidFormat || !fileContent}
            onClick={() =>
              navigate(resolveRelPath(`imagewizard/import`), {
                state: { blueprint: importedBlueprint },
              })
            }
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
