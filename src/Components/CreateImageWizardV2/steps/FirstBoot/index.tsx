import React from 'react';

import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { Text, Form, Title, Alert } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectFirstBootScript,
  setFirstBootScript,
} from '../../../../store/wizardSlice';

const FirstBootStep = () => {
  const dispatch = useAppDispatch();
  const selectedScript = useAppSelector(selectFirstBootScript);

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
      <CodeEditor
        isUploadEnabled
        isDownloadEnabled
        isCopyEnabled
        isLanguageLabelVisible
        language={Language.shell}
        onCodeChange={(code) => dispatch(setFirstBootScript(code))}
        code={selectedScript}
        height="35vh"
      />
    </Form>
  );
};

export default FirstBootStep;
