import React from 'react';

import {
  Button,
  Checkbox,
  Content,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Popover,
} from '@patternfly/react-core';
import { DropEvent } from '@patternfly/react-core/dist/esm/helpers';
import { HelpIcon } from '@patternfly/react-icons';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { useNavigate } from 'react-router-dom';
import TOML from 'smol-toml';

import { mapOnPremToHosted } from './helpers/onPremToHostedBlueprintMapper';

import {
  ApiRepositoryImportResponseRead,
  ApiRepositoryRequest,
  useBulkImportRepositoriesMutation,
} from '../../store/contentSourcesApi';
import { selectIsOnPremise } from '../../store/envSlice';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintExportResponse,
  BlueprintItem,
  CustomRepository,
} from '../../store/imageBuilderApi';
import { wizardState } from '../../store/wizardSlice';
import { getErrorMessage } from '../../Utilities/getErrorMessage';
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
    setIsOnPremBlueprint(false);
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const [fileContent, setFileContent] = React.useState('');
  const [importedBlueprint, setImportedBlueprint] =
    React.useState<wizardState>();
  const [isInvalidFormat, setIsInvalidFormat] = React.useState(false);
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const [isOnPremBlueprint, setIsOnPremBlueprint] = React.useState(false);
  const [isCheckedImportRepos, setIsCheckedImportRepos] = React.useState(true);
  const addNotification = useAddNotification();
  const [importRepositories] = useBulkImportRepositoriesMutation();

  const handleFileInputChange = (_event: DropEvent, file: File) => {
    setFileContent('');
    setFilename(file.name);
  };

  async function handleRepositoryImport(
    blueprintExportedResponse: BlueprintExportResponse,
  ): Promise<CustomRepository[] | undefined> {
    if (isCheckedImportRepos && blueprintExportedResponse.content_sources) {
      const customRepositories: ApiRepositoryRequest[] =
        blueprintExportedResponse.content_sources.map(
          (item) => item as ApiRepositoryRequest,
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
                ...mapToCustomRepositories(contentSourcesRepo),
              );
            }
            if (repository.warnings?.length === 0 && repository.url) {
              importedRepositoryNames.push(repository.url);
              return;
            }
            addNotification({
              variant: 'warning',
              title: 'Failed to import custom repositories',
              description: JSON.stringify(repository.warnings),
            });
          });

          if (importedRepositoryNames.length !== 0) {
            addNotification({
              variant: 'info',
              title: 'Successfully imported custom repositories',
              description: importedRepositoryNames.join(', '),
            });
          }
          return newCustomRepos;
        }
      } catch {
        addNotification({
          variant: 'danger',
          title: 'Custom repositories import failed',
        });
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
            const tomlBlueprint = TOML.parse(fileContent);
            const blueprintFromFile = await mapOnPremToHosted(
              tomlBlueprint as BlueprintItem,
            );
            const importBlueprintState = mapExportRequestToState(
              blueprintFromFile,
              [],
            );
            setIsOnPremBlueprint(true);
            setImportedBlueprint(importBlueprintState);
          } else if (isJson) {
            const blueprintFromFile = JSON.parse(fileContent);
            let customRepos: CustomRepository[] = [];
            try {
              // disk and filesystem are mutually exclusive
              // using both is invalid
              if (
                blueprintFromFile.customizations?.disk &&
                blueprintFromFile.customizations?.filesystem
              ) {
                setIsInvalidFormat(true);
                return;
              }

              if (
                blueprintFromFile.content_sources &&
                blueprintFromFile.content_sources.length > 0
              ) {
                const imported =
                  await handleRepositoryImport(blueprintFromFile);
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
                blueprintFromFile.image_requests || [],
              );

              setIsOnPremBlueprint(false);
              setImportedBlueprint(importBlueprintState);
            } catch (error) {
              // If the error is actually due to an invalid architecture or image type,
              // propagate it to label the blueprint as an invalid format,
              // as the wizard will just not be able to deal with it.
              if (
                error instanceof Error &&
                (error as Error).message.startsWith('image type:') &&
                (error as Error).message.endsWith('has no implementation yet')
              ) {
                throw error;
              }
              const blueprintFromFileMapped =
                await mapOnPremToHosted(blueprintFromFile);
              const importBlueprintState = mapExportRequestToState(
                blueprintFromFileMapped,
                [],
              );
              setIsOnPremBlueprint(true);
              setImportedBlueprint(importBlueprintState);
            }
          }
        } catch (error) {
          setIsInvalidFormat(true);
          addNotification({
            variant: 'warning',
            title: 'File is not a valid blueprint',
            description: getErrorMessage(error),
          });
        }
      };
      parseAndImport();
    }
  }, [filename, fileContent]);

  const handleClear = () => {
    setFilename('');
    setFileContent('');
    setIsOnPremBlueprint(false);
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const handleDataChange = (_: DropEvent, value: string) => {
    setFileContent(value);
  };
  const handleFileRejected = () => {
    setIsRejected(true);
    setIsOnPremBlueprint(false);
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
      case isOnPremBlueprint:
        return 'warning';
      default:
        return 'default';
    }
  };
  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onImportClose}
    >
      <ModalHeader
        title='Import blueprint files'
        help={
          <Popover
            maxWidth='30rem'
            position='right'
            bodyContent={
              <Content>
                You can import the blueprints you created by using the Red Hat
                image builder{' '}
                {!isOnPremise && 'into Red Hat Lightspeed images '}to create
                customized images.
              </Content>
            }
          >
            <Button
              icon={<HelpIcon />}
              variant='plain'
              aria-label='About import'
              isInline
            />
          </Popover>
        }
      />
      <ModalBody>
        <Form>
          <FormGroup fieldId='checkbox-import-custom-repositories'>
            <Checkbox
              label='Import missing custom repositories after file upload.'
              isChecked={isCheckedImportRepos}
              onChange={() => setIsCheckedImportRepos((prev) => !prev)}
              aria-label='Import Custom Repositories checkbox'
              id='checkbox-import-custom-repositories'
              name='Import Repositories'
            />
          </FormGroup>
          <FormGroup fieldId='import-blueprint-file-upload'>
            <FileUpload
              id='import-blueprint-file-upload'
              type='text'
              value={fileContent}
              filename={filename}
              filenamePlaceholder='Drag and drop a file or upload one'
              onFileInputChange={handleFileInputChange}
              onDataChange={handleDataChange}
              onReadStarted={handleFileReadStarted}
              onReadFinished={handleFileReadFinished}
              onClearClick={handleClear}
              isLoading={isLoading}
              isReadOnly={true}
              browseButtonText='Upload'
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
                      : isOnPremBlueprint
                        ? 'Importing on-premises blueprints is currently in beta. Results may vary.'
                        : 'Upload your blueprint file. Supported formats: JSON, TOML.'}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          type='button'
          isDisabled={isRejected || isInvalidFormat || !fileContent}
          onClick={() =>
            navigate(resolveRelPath(`imagewizard/import`), {
              state: { blueprint: importedBlueprint },
            })
          }
        >
          Review and finish
        </Button>
        <Button variant='link' type='button' onClick={onImportClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
