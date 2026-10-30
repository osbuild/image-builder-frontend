import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Stack,
} from '@patternfly/react-core';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeGcpAccountType,
  changeGcpPrincipal,
  selectGcpAccountType,
  selectGcpPrincipal,
  validateGcpAccount,
} from '@/store/slices/wizard';

export const GCP_ACCOUNT_TYPE_OPTIONS = new Map([
  ['user', 'Google account'],
  ['serviceAccount', 'Service account'],
  ['group', 'Google group'],
  ['domain', 'Google Workspace domain or Cloud Identity domain'],
]);

const Gcp = () => {
  const dispatch = useAppDispatch();
  const accountType = useAppSelector(selectGcpAccountType);
  const principal = useAppSelector(selectGcpPrincipal);
  const [draft, setDraft] = useState(principal ?? '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Reset local drafts when the account type or committed principal changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(principal ?? '');
  }, [accountType, principal]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          minWidth: '50%',
          maxWidth: '100%',
        } as React.CSSProperties
      }
    >
      {accountType
        ? GCP_ACCOUNT_TYPE_OPTIONS.get(accountType)
        : 'Select account type'}
    </MenuToggle>
  );

  const validator = (value: string) => {
    if (accountType === undefined) return validateGcpAccount();

    if (accountType === 'domain') {
      return validateGcpAccount({
        accountType,
        domain: value,
      });
    }

    return validateGcpAccount({
      accountType,
      email: value,
    });
  };

  const clear = () => {
    dispatch(changeGcpPrincipal(''));
  };

  return (
    <Stack hasGutter className='pf-v6-u-pb-md'>
      <FormGroup label='Account type' isRequired>
        <Select
          isOpen={isOpen}
          selected={accountType}
          onSelect={(_event, value) => {
            dispatch(changeGcpAccountType(value));
            setIsOpen(false);
          }}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={toggle}
          shouldFocusToggleOnSelect
        >
          <SelectList>
            {Array.from(GCP_ACCOUNT_TYPE_OPTIONS, ([key, label]) => (
              <SelectOption key={key} value={key}>
                {label}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </FormGroup>
      <FormGroup
        label={accountType === 'domain' ? 'Domain' : 'Principal'}
        isRequired
        style={{ maxWidth: '50%' }}
      >
        <ValidatedTextInput
          ariaLabel='google principal'
          value={draft}
          validator={validator}
          onChange={(_, value) => setDraft(value)}
          onCommit={(candidate) => {
            if (!candidate) return;

            dispatch(changeGcpPrincipal(candidate));
          }}
          handleClear={clear}
        />
      </FormGroup>
    </Stack>
  );
};

export default Gcp;
