import React from 'react';

import { CodeEditor, Language } from '@patternfly/react-code-editor';
import {
  Alert,
  Content,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Title,
} from '@patternfly/react-core';

import { FIRST_BOOT_SERVICE } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  addEnabledService,
  removeEnabledService,
  selectFirstBootScript,
  selectRegistrationType,
  setFirstBootScript,
} from '../../../../store/wizardSlice';
import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';
import { useFirstBootValidation } from '../../utilities/useValidation';

const detectScriptType = (scriptString: string): Language => {
  const lines = scriptString.split('\n');

  if (lines[0].startsWith('#!')) {
    // Extract the path from the shebang
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
  // default
  return Language.shell;
};

const FirstBootStep = () => {
  const dispatch = useAppDispatch();
  const selectedScript = useAppSelector(selectFirstBootScript);
  const registrationType = useAppSelector(selectRegistrationType);
  const language = detectScriptType(selectedScript);
  const { errors } = useFirstBootValidation();

  return (
    <Form>
      <CustomizationLabels customization='firstBoot' />
      <Title headingLevel='h1' size='xl'>
        First boot configuration
      </Title>
      <Content>
        Configure the image with a custom script that will execute on its first
        boot.
        {registrationType !== 'register-later' && (
          <> First boot script will run after registration is done.</>
        )}
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
        <CodeEditor
          isUploadEnabled
          isDownloadEnabled
          isCopyEnabled
          isLanguageLabelVisible
          language={language}
          onCodeChange={(code) => {
            if (!selectedScript && !!code) {
              dispatch(addEnabledService(FIRST_BOOT_SERVICE));
            } else if (!!selectedScript && !code) {
              dispatch(removeEnabledService(FIRST_BOOT_SERVICE));
            }
            // In case the user is on windows
            dispatch(setFirstBootScript(code.replace('\r\n', '\n')));
          }}
          code={selectedScript}
          height='35vh'
          emptyStateButton='Browse'
          emptyStateLink='Start from scratch'
        />
        {errors.script && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant='error'>{errors.script}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    </Form>
  );
};

export default FirstBootStep;
