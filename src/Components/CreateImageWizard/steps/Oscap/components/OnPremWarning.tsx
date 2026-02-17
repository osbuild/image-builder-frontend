import React from 'react';

import {
  Alert,
  ClipboardCopy,
  CodeBlock,
  CodeBlockCode,
  FormGroup,
} from '@patternfly/react-core';

const OscapOnPremWarning = () => {
  return (
    <>
      <FormGroup>
        <Alert
          style={{
            margin:
              '0 var(--pf-v6-c-toolbar__content--PaddingRight) 0 var(--pf-v6-c-toolbar__content--PaddingLeft)',
          }}
          isInline
          variant='warning'
          title='The packages required to apply security profiles by using OpenSCAP are missing on this host. Install them with the following command'
        />
      </FormGroup>
      <FormGroup>
        <CodeBlock>
          <CodeBlockCode>
            <ClipboardCopy
              hoverTip='Copy'
              clickTip='Copied'
              variant='inline-compact'
            >
              sudo dnf install openscap-scanner scap-security-guide
            </ClipboardCopy>
          </CodeBlockCode>
        </CodeBlock>
      </FormGroup>
    </>
  );
};

export default OscapOnPremWarning;
