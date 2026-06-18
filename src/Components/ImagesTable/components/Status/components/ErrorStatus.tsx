import React from 'react';

import {
  Alert,
  Button,
  CodeBlock,
  CodeBlockCode,
  Content,
  Flex,
  Panel,
  PanelMain,
  Popover,
} from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';

import { ComposeStatusError } from '@/store/api/backend';

import './../../ImageBuildStatus.scss';

type ErrorStatusPropTypes = {
  icon: JSX.Element;
  text: JSX.Element;
  error: ComposeStatusError | string;
};

const ErrorStatus = ({ icon, text, error }: ErrorStatusPropTypes) => {
  let reason = '';
  const detailsArray: string[] = [];
  if (typeof error === 'string') {
    reason = error;
  } else {
    if (error.reason) {
      reason = error.reason;
    }
    if (Array.isArray(error.details)) {
      for (const line in error.details) {
        const detail = error.details[line];
        if (detail && typeof detail === 'object' && 'reason' in detail) {
          detailsArray.push(String(detail.reason));
        } else {
          detailsArray.push(String(detail));
        }
      }
    }
    if (typeof error.details === 'string') {
      detailsArray.push(error.details);
    }
    if (error.details?.reason) {
      detailsArray.push(`${error.details.reason}`);
    }
  }

  return (
    <Flex className='pf-v6-u-align-items-baseline pf-m-nowrap'>
      <div className='pf-v6-u-mr-sm'>{icon}</div>
      <Popover
        data-testid='errorstatus-popover'
        position='bottom'
        minWidth='40rem'
        bodyContent={
          <>
            <Alert variant='danger' title={text} isInline isPlain />
            <Content component='p' className='pf-v6-u-pt-md pf-v6-u-pb-md'>
              {reason}
            </Content>
            <Panel isScrollable>
              <PanelMain maxHeight='25rem'>
                <CodeBlock>
                  <CodeBlockCode>{detailsArray.join('\n')}</CodeBlockCode>
                </CodeBlock>
              </PanelMain>
            </Panel>
            <Button
              icon={<CopyIcon />}
              variant='link'
              onClick={() =>
                navigator.clipboard.writeText(
                  reason + '\n\n' + detailsArray.join('\n'),
                )
              }
              className='pf-v6-u-pl-0 pf-v6-u-mt-md'
            >
              Copy error text to clipboard
            </Button>
          </>
        }
      >
        <Button variant='link' className='pf-v6-u-p-0 pf-v6-u-font-size-sm'>
          <div className='failure-button'>{text}</div>
        </Button>
      </Popover>
    </Flex>
  );
};

export default ErrorStatus;
