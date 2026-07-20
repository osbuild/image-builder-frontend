import React, { useState } from 'react';

import {
  Button,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  TextInputGroup,
  TextInputGroupMain,
  Truncate,
} from '@patternfly/react-core/dist/esm';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { UnknownAction } from 'redux';

import { StepValidation } from './utilities/useValidation';

import { UNDEFINED_GROUPS_WARNING_KEY } from '../../constants';
import { useAppDispatch } from '../../store/hooks';

const DEFAULT_TRUNCATE_LENGTH = 20;
const DEFAULT_CHIP_COLLAPSE_THRESHOLD = 4;

type LabelInputProps = {
  ariaLabel: string;
  placeholder: string;
  validator: (value: string) => boolean;
  requiredList?: string[] | undefined;
  list: string[] | undefined;
  item: string;
  addAction: (value: string) => UnknownAction;
  removeAction: (value: string) => UnknownAction;
  stepValidation: StepValidation;
  fieldName: string;
  truncateLength?: number;
  isCompact?: boolean;
  chipCollapseThreshold?: number;
  hideAddLabel?: boolean;
};

const LabelInput = ({
  ariaLabel,
  placeholder,
  validator,
  list,
  requiredList,
  item,
  addAction,
  removeAction,
  stepValidation,
  fieldName,
  truncateLength = DEFAULT_TRUNCATE_LENGTH,
  isCompact = false,
  chipCollapseThreshold = DEFAULT_CHIP_COLLAPSE_THRESHOLD,
  hideAddLabel = false,
}: LabelInputProps) => {
  const dispatch = useAppDispatch();

  const [inputValue, setInputValue] = useState('');
  const [onStepInputErrorText, setOnStepInputErrorText] = useState('');
  let [invalidImports, duplicateImports] = ['', ''];

  if (stepValidation.errors[fieldName]) {
    [invalidImports, duplicateImports] =
      stepValidation.errors[fieldName].split('|');
  }

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setInputValue(value);
    setOnStepInputErrorText('');
  };

  const addItem = (value: string) => {
    if (!value.trim()) {
      return;
    }

    if (list?.includes(value) || requiredList?.includes(value)) {
      setOnStepInputErrorText(`${item} already exists.`);
      return;
    }

    if (!validator(value)) {
      switch (fieldName) {
        case 'ports':
          setOnStepInputErrorText(
            'Expected format: <port/port-name>:<protocol>. Example: 8080:tcp, ssh:tcp',
          );
          break;
        case 'kernelAppend':
          setOnStepInputErrorText(
            'Expected format: <kernel-argument>. Example: console=tty0',
          );
          break;
        case 'kernelName':
          setOnStepInputErrorText(
            'Expected format: <kernel-name>. Example: kernel-5.14.0-284.11.1.el9_2.x86_64',
          );
          break;
        case 'groups':
          setOnStepInputErrorText(
            'Expected format: <group-name>. Example: admin',
          );
          break;
        case 'ntpServers':
          setOnStepInputErrorText(
            'Expected format: <ntp-server>. Example: time.redhat.com',
          );
          break;
        case 'enabledSystemdServices':
        case 'disabledSystemdServices':
        case 'maskedSystemdServices':
          setOnStepInputErrorText(
            'Expected format: <service-name>. Example: sshd',
          );
          break;
        case 'disabledServices':
        case 'enabledServices':
          setOnStepInputErrorText(
            'Expected format: <firewalld-service-name>. Example: ssh.',
          );
          break;
        default:
          setOnStepInputErrorText('Invalid format.');
      }
      return;
    }

    dispatch(addAction(value));
    setInputValue('');
    setOnStepInputErrorText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(value);
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, value: string) => {
    dispatch(removeAction(value));
  };

  const errors = [];
  if (onStepInputErrorText) errors.push(onStepInputErrorText);
  if (invalidImports) errors.push(invalidImports);
  if (duplicateImports) errors.push(duplicateImports);

  const warning = stepValidation.errors[UNDEFINED_GROUPS_WARNING_KEY];
  const totalItems = (requiredList?.length ?? 0) + (list?.length ?? 0);

  return (
    <>
      <Flex flexWrap={{ default: 'nowrap' }}>
        <FlexItem grow={{ default: 'grow' }}>
          <TextInputGroup>
            <TextInputGroupMain
              aria-label={ariaLabel}
              placeholder={placeholder}
              onChange={onTextInputChange}
              value={inputValue}
              onKeyDown={(e) => handleKeyDown(e, inputValue)}
            >
              {totalItems > 0 && (
                <LabelGroup
                  isCompact={isCompact}
                  numLabels={chipCollapseThreshold}
                  expandedText='Show less'
                  collapsedText={
                    totalItems > chipCollapseThreshold
                      ? `${totalItems - chipCollapseThreshold} more`
                      : undefined
                  }
                  className='pf-v6-u-mr-sm'
                >
                  {requiredList?.map((labelItem) => (
                    <Label key={labelItem}>{labelItem}</Label>
                  ))}
                  {list?.map((labelItem) => (
                    <Label
                      key={labelItem}
                      color='blue'
                      isCompact={isCompact}
                      onClose={(e) => handleRemoveItem(e, labelItem)}
                      closeBtnAriaLabel={`Remove ${labelItem}`}
                    >
                      <Truncate
                        content={labelItem}
                        maxCharsDisplayed={truncateLength}
                      />
                    </Label>
                  ))}
                </LabelGroup>
              )}
            </TextInputGroupMain>
          </TextInputGroup>
        </FlexItem>
        <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
          <Button
            variant='control'
            aria-label='Add'
            icon={<PlusCircleIcon />}
            onClick={() => addItem(inputValue)}
          >
            {!hideAddLabel && 'Add'}
          </Button>
        </FlexItem>
      </Flex>

      <HelperText>
        {errors.length > 0
          ? errors.map((error, index) => (
              <HelperTextItem key={index} variant={'error'}>
                {error}
              </HelperTextItem>
            ))
          : !warning && (
              <HelperTextItem>
                Press Enter or click {hideAddLabel ? 'the add icon' : 'Add'}
              </HelperTextItem>
            )}
        {warning && (
          <HelperTextItem variant={'warning'}>{warning}</HelperTextItem>
        )}
      </HelperText>
    </>
  );
};

export default LabelInput;
