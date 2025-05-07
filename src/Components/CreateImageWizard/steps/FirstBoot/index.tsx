import React from 'react';

import { CodeEditor, Language } from '@patternfly/react-code-editor';
import {
  Text,
  Form,
  FormGroup,
  FormHelperText,
  Title,
  Alert,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import { FIRST_BOOT_SERVICE } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  addEnabledService,
  removeEnabledService,
  selectFirstBootScript,
  setFirstBootScript,
} from '../../../../store/wizardSlice';
import { useFirstBootValidation } from '../../utilities/useValidation';

const detectScriptType = (scriptString: string): Language => {
  const lines = scriptString.split('\n');

  if (lines[0].startsWith('#!')) {
    // Extract the path from the shebang
    const path = lines[0].slice(2);

    if (path.includes('bin/bash') || path.includes('bin/sh')) {
      return Language.shell;
    } else if (path.includes('bin/python') || path.includes('bin/python3')) {
      return Language.python;
    } else if (path.includes('ansible-playbook')) {
      return Language.yaml;
    }
  }
  // default
  return Language.shell;
};

const FirstBootStep = () => {
  const dispatch = useAppDispatch();
  const selectedScript = useAppSelector(selectFirstBootScript);
  const language = detectScriptType(selectedScript);
  const { errors } = useFirstBootValidation();

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        First boot configuration
      </Title>
      <Text>
        Configure the image with a custom script that will execute on its first
        boot.
      </Text>
      <Alert
        variant="warning"
        isExpandable
        isInline
        title="Important: please do not include sensitive information"
      >
        <Text>
          Please ensure that your script does not contain any secrets,
          passwords, or other sensitive data. All scripts should be crafted
          without including confidential information to maintain security and
          privacy.
        </Text>
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
          height="35vh"
          emptyStateButton="Browse"
          emptyStateLink="Start from scratch"
        />
        {errors.script && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error" hasIcon>
                {errors.script}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    </Form>
  );
};

export default FirstBootStep;
