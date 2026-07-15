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
import TOML from 'smol-toml';

import {
  BlueprintExportResponse,
  BlueprintItem,
  CustomRepository,
} from '@/store/api/backend';
import { mapOnPremToHosted } from '@/store/api/backend/onprem/composerApi/helpers/blueprintMapper';
import {
  ApiRepositoryImportResponseRead,
  ApiRepositoryRequest,
  useBulkImportRepositoriesMutation,
  useLazyListRepositoriesQuery,
} from '@/store/api/contentSources';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  isSupportedArchitecture,
  loadWizardState,
  mapToCustomRepositories,
  parseStateFromRequest,
  WizardState,
} from '@/store/slices/wizard';
import { openWizardModal } from '@/store/slices/wizardModal';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getErrorMessage } from '../../Utilities/getErrorMessage';

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
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const [fileContent, setFileContent] = React.useState('');
  const [importedBlueprint, setImportedBlueprint] =
    React.useState<WizardState>();
  const [isInvalidFormat, setIsInvalidFormat] = React.useState(false);
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const [isOnPremBlueprint, setIsOnPremBlueprint] = React.useState(false);
  const [isCheckedImportRepos, setIsCheckedImportRepos] = React.useState(true);
  const addNotification = useAddNotification();
  const [importRepositories] = useBulkImportRepositoriesMutation();
  const [listRepositories] = useLazyListRepositoriesQuery();

  const handleFileInputChange = (_event: DropEvent, file: File) => {
    setFileContent('');
    setFilename(file.name);
  };

  async function handleRepositoryImport(
    blueprintExportedResponse: BlueprintExportResponse,
  ): Promise<CustomRepository[] | undefined> {
    if (!isCheckedImportRepos || !blueprintExportedResponse.content_sources) {
      return;
    }

    const contentSources =
      blueprintExportedResponse.content_sources as ApiRepositoryRequest[];
    const allUrls = contentSources
      .map((cs) => cs.url)
      .filter((url): url is string => !!url);

    if (allUrls.length === 0) {
      return;
    }

    // Look up which repos already exist in the user's content sources
    const existingCustomRepos: CustomRepository[] = [];
    const existingUrls = new Set<string>();

    try {
      const listResult = await listRepositories({
        url: allUrls.join(','),
        limit: allUrls.length,
      }).unwrap();

      for (const repo of listResult.data ?? []) {
        if (repo.url) {
          existingUrls.add(repo.url);
        }
        existingCustomRepos.push(...mapToCustomRepositories(repo));
      }

      if (existingUrls.size > 0) {
        addNotification({
          variant: 'info',
          title: 'Custom repositories already exist',
          description: [...existingUrls].join(', '),
        });
      }
    } catch (error) {
      // If the lookup fails, fall through and try to import all repos
      // eslint-disable-next-line no-console
      console.error('Failed to look up existing repositories:', error);
    }

    // Filter to only repos that don't already exist
    const newContentSources = contentSources.filter(
      (cs: ApiRepositoryRequest) => !cs.url || !existingUrls.has(cs.url),
    );

    if (newContentSources.length === 0) {
      return existingCustomRepos;
    }

    // Import only the genuinely new repos
    try {
      const result = await importRepositories({
        body: newContentSources,
      }).unwrap();
      if (Array.isArray(result)) {
        const importedRepositoryNames: string[] = [];
        const newCustomRepos: CustomRepository[] = [];
        result.forEach((repository) => {
          const contentSourcesRepo =
            repository as ApiRepositoryImportResponseRead;
          if (contentSourcesRepo.uuid) {
            newCustomRepos.push(...mapToCustomRepositories(contentSourcesRepo));
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
        return [...existingCustomRepos, ...newCustomRepos];
      }
    } catch {
      addNotification({
        variant: 'danger',
        title: 'Custom repositories import failed',
      });
    }

    // If bulk import failed, still return any existing repos we found
    if (existingCustomRepos.length > 0) {
      return existingCustomRepos;
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
            const importBlueprintState =
              parseStateFromRequest(blueprintFromFile);
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

              // reject architectures the wizard cannot handle
              const arch = blueprintFromFile.image_requests?.[0]?.architecture;
              if (arch && !isSupportedArchitecture(arch)) {
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
                bootc: blueprintFromFile.bootc,
                customizations: blueprintFromFile.customizations,
                metadata: blueprintFromFile.metadata,
                content_sources: blueprintFromFile.content_sources,
                snapshot_date: blueprintFromFile.snapshot_date,
              };
              blueprintExportedResponse.customizations.custom_repositories =
                customRepos;
              blueprintExportedResponse.customizations.payload_repositories =
                undefined;
              const importBlueprintState = parseStateFromRequest(
                blueprintExportedResponse,
              );

              setIsOnPremBlueprint(false);
              setImportedBlueprint(importBlueprintState);
            } catch (_error) {
              const blueprintFromFileMapped =
                await mapOnPremToHosted(blueprintFromFile);
              const importBlueprintState = parseStateFromRequest(
                blueprintFromFileMapped,
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

  const handleReviewAndFinish = () => {
    if (!importedBlueprint) return;

    dispatch(loadWizardState(importedBlueprint));
    dispatch(openWizardModal('import'));
    setShowImportModal(false);
  };

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
          isDisabled={
            isRejected || isInvalidFormat || !fileContent || !importedBlueprint
          }
          onClick={handleReviewAndFinish}
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
