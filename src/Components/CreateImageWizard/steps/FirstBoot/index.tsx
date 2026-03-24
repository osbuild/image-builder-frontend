import React, { useRef, useState } from 'react';

import {
  CodeEditor,
  CodeEditorControl,
  Language,
} from '@patternfly/react-code-editor';
import {
  Alert,
  Content,
  DropEvent,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Title,
} from '@patternfly/react-core';
import { UndoIcon } from '@patternfly/react-icons';

import { useFirstBootValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { FIRST_BOOT_SERVICE } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addEnabledService,
  removeEnabledService,
  selectFirstBootScript,
  selectRegistrationType,
  setFirstBootScript,
} from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

// Inline <style> needed because sassPrefix wraps SCSS in .imageBuilder,
// but the wizard Modal renders in a portal outside that wrapper.
const editorStyles = `
.first-boot-editor .pf-v6-c-code-editor__header-content {
  background-color: var(--pf-t--global--background--color--primary--default);
}
.first-boot-editor .pf-v6-c-code-editor__controls {
  flex: 1;
  justify-content: flex-end;
}
.first-boot-editor button[aria-label='Upload code'] {
  display: none;
}`;

const detectScriptType = (scriptString: string): Language => {
  const lines = scriptString.split('\n');

  if (lines[0].startsWith('#!')) {
    const path = lines[0].slice(2);

    if (path.includes('bin/bash') || path.includes('bin/sh')) {
      return Language.shell;
    }

    if (path.includes('bin/python') || path.includes('bin/python3')) {
      return Language.python;
    }

    if (path.includes('ansible-playbook')) {
      return Language.yaml;
    }
  }
  return Language.shell;
};

const FirstBootStep = () => {
  const dispatch = useAppDispatch();
  const selectedScript = useAppSelector(selectFirstBootScript);
  const registrationType = useAppSelector(selectRegistrationType);
  const language = detectScriptType(selectedScript);
  const { errors } = useFirstBootValidation();
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  const initialScriptRef = useRef(selectedScript);
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedScript, setUploadedScript] = useState('');

  const handleScriptChange = (newScript: string) => {
    if (!selectedScript && !!newScript) {
      dispatch(addEnabledService(FIRST_BOOT_SERVICE));
    } else if (!!selectedScript && !newScript) {
      dispatch(removeEnabledService(FIRST_BOOT_SERVICE));
    }
    // In case the user is on windows
    dispatch(setFirstBootScript(newScript.replace(/\r\n/g, '\n')));
  };

  const handleFileInputChange = (_event: DropEvent, file: File) => {
    setFilename(file.name);
  };

  const handleDataChange = (_event: DropEvent, value: string) => {
    const normalizedValue = value.replace(/\r\n/g, '\n');
    setUploadedScript(normalizedValue);
    handleScriptChange(value);
  };

  const handleClear = () => {
    setFilename('');
    setUploadedScript('');
    handleScriptChange('');
  };

  const handleFileReadStarted = () => {
    setIsLoading(true);
  };

  const handleFileReadFinished = () => {
    setIsLoading(false);
  };

  const handleRevert = () => {
    handleScriptChange(uploadedScript || initialScriptRef.current);
  };

  const customControls = [
    <CodeEditorControl
      key='revert-button'
      icon={<UndoIcon />}
      aria-label='Revert changes'
      onClick={handleRevert}
      tooltipProps={{ content: 'Revert changes' }}
    />,
  ];

  return (
    <Wrapper>
      <CustomizationLabels customization='firstBoot' />
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
        >
          First boot configuration
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Add a custom script to be executed when the image boots for the first
          time.
          {registrationType !== 'register-later' && (
            <> The first boot script will run after registration is done.</>
          )}
        </Content>
      </Content>

      <Alert
        variant='warning'
        isExpandable
        isInline
        title='Important: please do not include sensitive information'
      >
        <Content>
          Please ensure that your script does not contain any secrets,
          passwords, or other sensitive data. All scripts should be crafted
          without including confidential information to maintain security and
          privacy.
        </Content>
      </Alert>
      <FormGroup>
        <FileUpload
          id='first-boot-script-upload'
          type='text'
          filename={filename}
          filenamePlaceholder='Drag and drop a file or upload'
          onFileInputChange={handleFileInputChange}
          onDataChange={handleDataChange}
          onReadStarted={handleFileReadStarted}
          onReadFinished={handleFileReadFinished}
          onClearClick={handleClear}
          isLoading={isLoading}
          allowEditingUploadedText={false}
          browseButtonText='Upload'
          hideDefaultPreview
        />
      </FormGroup>
      <FormGroup>
        <CodeEditor
          className='first-boot-editor'
          language={language}
          onCodeChange={(code) => handleScriptChange(code)}
          code={selectedScript}
          height='35vh'
          isCopyEnabled
          isDownloadEnabled
          isUploadEnabled
          emptyStateBody='Drag a file here, upload files, or start from scratch.'
          emptyStateButton='Upload files'
          emptyStateLink='Start from scratch'
          customControls={customControls}
        />
        <style>{editorStyles}</style>
        <HelperText className='pf-v6-u-pt-sm'>
          <HelperTextItem>
            Supports bash shell, python, or Ansible playbooks
          </HelperTextItem>
        </HelperText>
        {errors.script && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant='error'>{errors.script}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    </Wrapper>
  );
};

export default FirstBootStep;
