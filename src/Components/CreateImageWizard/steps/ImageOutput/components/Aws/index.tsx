import React, { useState } from 'react';

import {
  Flex,
  FlexItem,
  FormGroup,
  HelperText,
  HelperTextItem,
  Stack,
  TextInput,
} from '@patternfly/react-core';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeAwsAccountId,
  selectAwsAccountId,
  validateAwsAccountId,
} from '@/store/slices/wizard';

const Aws = () => {
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const shareWithAccount = useAppSelector(selectAwsAccountId);

  const [draft, setDraft] = useState(shareWithAccount ?? '');

  const clear = () => {
    setDraft('');
    dispatch(changeAwsAccountId(''));
  };

  return (
    <Stack hasGutter className='pf-v6-u-pb-md'>
      {!isOnPremise && (
        <Flex spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <FormGroup label='AWS account ID' isRequired>
              <ValidatedTextInput
                ariaLabel='aws account id'
                value={draft}
                validator={(value) => validateAwsAccountId(value)}
                onChange={(_, value) => setDraft(value)}
                onCommit={(accountId) => {
                  if (!accountId) return;
                  dispatch(changeAwsAccountId(accountId));
                }}
                handleClear={clear}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem>
            <FormGroup label='Default region' isRequired>
              <TextInput
                value={'us-east-1'}
                type='text'
                aria-label='default region'
                readOnlyVariant='default'
              />
            </FormGroup>
            <HelperText className='pf-v6-u-pt-sm'>
              <HelperTextItem>
                Images are built in the default region but can be copied to
                other regions later.
              </HelperTextItem>
            </HelperText>
          </FlexItem>
        </Flex>
      )}
      {isOnPremise && (
        <HelperText className='pf-v6-u-pt-sm'>
          <HelperTextItem>
            Configure AWS uploads, including the region, by configuring cloud
            providers on the main page.
          </HelperTextItem>
        </HelperText>
      )}
    </Stack>
  );
};

export default Aws;
