import React, { useEffect, useState } from 'react';

import {
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core/dist/esm';
import { UnknownAction } from 'redux';

import { StepValidation } from './utilities/useValidation';

import { useAppDispatch } from '../../store/hooks';

const FIREWALL_LABEL_TRUNCATE_DEFAULT = 20;

type LabelInputProps = {
  ariaLabel: string;
  placeholder: string;
  validator: (value: string) => boolean;
  requiredList?: string[] | undefined;
  requiredCategoryName?: string;
  list: string[] | undefined;
  item: string;
  addAction: (value: string) => UnknownAction;
  removeAction: (value: string) => UnknownAction;
  stepValidation: StepValidation;
  fieldName: string;
  onInputErrorChange?: (hasError: boolean) => void;
  currentInputValue?: string;
  onInputValueChange?: (value: string) => UnknownAction;
  addOnBlur?: boolean;
};

const LabelInput = ({
  ariaLabel,
  placeholder,
  validator,
  list,
  requiredList,
  requiredCategoryName,
  item,
  addAction,
  removeAction,
  stepValidation,
  fieldName,
  onInputErrorChange,
  currentInputValue,
  onInputValueChange,
  addOnBlur = false,
}: LabelInputProps) => {
  const dispatch = useAppDispatch();

  const useReduxState =
    currentInputValue !== undefined && onInputValueChange !== undefined;
  const [localInputValue, setLocalInputValue] = useState('');
  const inputValue = useReduxState ? currentInputValue! : localInputValue;

  const [onStepInputErrorText, setOnStepInputErrorText] = useState('');

  const validationErrorText = stepValidation.errors[fieldName] || '';
  const validationErrors = React.useMemo(
    () =>
      validationErrorText
        ? validationErrorText.split(/\s*\|\s*/).filter((e) => e.trim())
        : [],
    [validationErrorText],
  );

  useEffect(() => {
    onInputErrorChange?.(!!onStepInputErrorText || validationErrors.length > 0);
  }, [onStepInputErrorText, validationErrors, onInputErrorChange]);

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    if (useReduxState) {
      dispatch(onInputValueChange!(value));
    } else {
      setLocalInputValue(value);
    }
    setOnStepInputErrorText('');
  };

  const addItem = (value: string): boolean => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return false;
    }

    if (list?.includes(trimmedValue) || requiredList?.includes(trimmedValue)) {
      setOnStepInputErrorText(`${item} already exists.`);
      onInputErrorChange?.(true);
      return false;
    }

    if (!validator(trimmedValue)) {
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
      onInputErrorChange?.(true);
      return false;
    }

    dispatch(addAction(trimmedValue));
    if (useReduxState) {
      dispatch(onInputValueChange!(''));
    } else {
      setLocalInputValue('');
    }
    setOnStepInputErrorText('');
    onInputErrorChange?.(false);
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(value);
    }
  };

  const handleBlur = () => {
    if (!addOnBlur) return;
    if (inputValue.trim()) {
      addItem(inputValue);
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, value: string) => {
    dispatch(removeAction(value));
  };

  const errors = [];
  if (onStepInputErrorText) errors.push(onStepInputErrorText);
  // Filter out validation errors that are already shown in onStepInputErrorText
  const filteredValidationErrors = validationErrors.filter((error) => {
    if (
      onStepInputErrorText.includes('already exists') &&
      error.includes('Group already exists')
    ) {
      return false;
    }
    return true;
  });
  errors.push(...filteredValidationErrors);

  return (
    <>
      <TextInputGroup>
        <TextInputGroupMain
          aria-label={ariaLabel}
          placeholder={placeholder}
          onChange={onTextInputChange}
          value={inputValue}
          onKeyDown={(e) => handleKeyDown(e, inputValue)}
          onBlur={handleBlur}
        >
          {list && list.length > 0 && (
            <LabelGroup numLabels={20} className='pf-v6-u-mr-sm'>
              {list.map((item) => (
                <Label
                  key={item}
                  color='blue'
                  onClose={(e) => handleRemoveItem(e, item)}
                >
                  {item.length > FIREWALL_LABEL_TRUNCATE_DEFAULT
                    ? `${item.slice(0, FIREWALL_LABEL_TRUNCATE_DEFAULT)}...`
                    : item}
                </Label>
              ))}
            </LabelGroup>
          )}
        </TextInputGroupMain>
      </TextInputGroup>
      {errors.length > 0 && (
        <HelperText>
          {errors.map((error, index) => (
            <HelperTextItem key={index} variant={'error'}>
              {error}
            </HelperTextItem>
          ))}
        </HelperText>
      )}
      {requiredList && requiredList.length > 0 && (
        <LabelGroup
          categoryName={requiredCategoryName}
          numLabels={20}
          className='pf-v6-u-mt-sm pf-v6-u-w-100'
        >
          {requiredList.map((item) => (
            <Label key={item} isCompact>
              {item}
            </Label>
          ))}
        </LabelGroup>
      )}
    </>
  );
};

export default LabelInput;
