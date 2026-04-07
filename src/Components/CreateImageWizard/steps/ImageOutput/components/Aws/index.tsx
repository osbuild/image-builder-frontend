import React, { useState } from 'react';

import {
  Form,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
  TextInput,
} from '@patternfly/react-core';

import { AWS_REGIONS } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeAwsAccountId,
  changeAwsRegion,
  selectAwsAccountId,
  selectAwsRegion,
} from '@/store/slices/wizard';

import { ValidatedInput } from '../../../../ValidatedInput';
import { isAwsAccountIdValid } from '../../../../validators';

export type AwsShareMethod = 'manual';

type FormGroupProps<T> = {
  value: string;
  onChange: (value: T) => void;
};

const AWSRegion = ({ value, onChange }: FormGroupProps<string>) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    onChange(value as string);
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      style={
        {
          width: '50%',
        } as React.CSSProperties
      }
    >
      {value}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      isScrollable
      selected={value}
      onSelect={onSelect}
      onOpenChange={() => setIsOpen(!isOpen)}
      toggle={toggle}
    >
      {AWS_REGIONS.map(({ description, value: region }) => (
        <SelectOption key={description} value={region}>
          {region}
        </SelectOption>
      ))}
    </Select>
  );
};

const Aws = () => {
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const shareWithAccount = useAppSelector(selectAwsAccountId);
  const region = useAppSelector(selectAwsRegion);

  return (
    <Form className='pf-v6-u-pb-md'>
      <>
        {!isOnPremise && (
          <FormGroup label='AWS account ID' isRequired>
            <ValidatedInput
              aria-label='aws account id'
              value={shareWithAccount || ''}
              validator={isAwsAccountIdValid}
              onChange={(_event, value) => dispatch(changeAwsAccountId(value))}
              helperText={
                !shareWithAccount
                  ? 'AWS account ID is required'
                  : 'Should be 12 characters long'
              }
              handleClear={() => dispatch(changeAwsAccountId(''))}
            />
          </FormGroup>
        )}
        {!isOnPremise && (
          <FormGroup label='Default region' isRequired>
            <TextInput
              value={'us-east-1'}
              type='text'
              aria-label='default region'
              readOnlyVariant='default'
            />
          </FormGroup>
        )}
        {isOnPremise && (
          <FormGroup label='Region' isRequired>
            <AWSRegion
              value={region || ''}
              onChange={(v) => dispatch(changeAwsRegion(v))}
            />
          </FormGroup>
        )}
      </>
    </Form>
  );
};

export default Aws;
