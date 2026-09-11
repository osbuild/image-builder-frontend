import React, { useId, useMemo, useState } from 'react';

import {
  Button,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  TextInputGroup,
  TextInputGroupMain,
  Truncate,
} from '@patternfly/react-core/dist/esm';
import { PlusCircleIcon } from '@patternfly/react-icons';

import type { ValidationResult } from '@/store/slices/wizard/types';
import type { MergedListItem } from '@/Utilities/mergeListItems';

import ValidatedInputHelperText from './ValidatedInputHelperText';

const DEFAULT_TRUNCATE_LENGTH = 20;
const DEFAULT_MAX_VISIBLE_ITEMS = 4;

type ValidatedListInputProps = {
  ariaLabel: string;
  placeholder: string;
  validator: (items: string[]) => ValidationResult;
  items: MergedListItem[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  truncateLength?: number;
  isCompact?: boolean;
  maxVisibleItems?: number;
  hideAddLabel?: boolean;
  helperText?: string;
  addButtonAriaLabel?: string;
};

const ValidatedListInput = ({
  ariaLabel,
  placeholder,
  validator,
  items,
  onAdd,
  onRemove,
  truncateLength = DEFAULT_TRUNCATE_LENGTH,
  isCompact = false,
  maxVisibleItems = DEFAULT_MAX_VISIBLE_ITEMS,
  hideAddLabel = false,
  helperText,
  addButtonAriaLabel = 'Add',
}: ValidatedListInputProps) => {
  const [inputValue, setInputValue] = useState('');
  // The value from the last rejected add attempt. Errors are derived from it
  // against the current items, so removing a conflicting chip clears them.
  const [attemptedValue, setAttemptedValue] = useState<string | null>(null);
  const helperTextId = useId();

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setInputValue(value);
    setAttemptedValue(null);
  };

  const allValues = useMemo(() => items.map((item) => item.value), [items]);

  const addItem = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    // Only block the add when the new value itself is the problem (bad
    // format or a duplicate). Pre-existing invalid items in the store must
    // not prevent the user from adding otherwise-valid input.
    const newValueIssues = validator([...allValues, trimmed]).filter(
      (issue) => issue.value === trimmed,
    );
    if (newValueIssues.length > 0) {
      setAttemptedValue(trimmed);
      return;
    }

    onAdd(trimmed);
    setInputValue('');
    setAttemptedValue(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(value);
    }
  };

  // Errors attributable to the last rejected add attempt only.
  const attemptErrors = useMemo(
    () =>
      attemptedValue !== null
        ? validator([...allValues, attemptedValue]).filter(
            (issue) => issue.value === attemptedValue,
          )
        : [],
    [attemptedValue, allValues, validator],
  );

  // Validate items already in the store (e.g. loaded from a blueprint).
  const storeIssues = useMemo(
    () => (allValues.length > 0 ? validator(allValues) : []),
    [allValues, validator],
  );

  const allErrors = [...attemptErrors, ...storeIssues];

  return (
    <Flex flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }}>
        <TextInputGroup validated={allErrors.length > 0 ? 'error' : 'default'}>
          <TextInputGroupMain
            aria-label={ariaLabel}
            placeholder={placeholder}
            onChange={onTextInputChange}
            value={inputValue}
            onKeyDown={(e) => handleKeyDown(e, inputValue)}
            inputProps={{
              'aria-describedby': helperTextId,
              'aria-invalid': allErrors.length > 0 || undefined,
            }}
          >
            {items.length > 0 && (
              <LabelGroup
                isCompact={isCompact}
                numLabels={maxVisibleItems}
                expandedText='Show less'
                collapsedText={
                  items.length > maxVisibleItems
                    ? `${items.length - maxVisibleItems} more`
                    : undefined
                }
                className='pf-v6-u-mr-sm'
              >
                {items.map((item) =>
                  item.required ? (
                    <Label key={item.value}>{item.value}</Label>
                  ) : (
                    <Label
                      key={item.value}
                      color='blue'
                      isCompact={isCompact}
                      onClose={() => onRemove(item.value)}
                      closeBtnAriaLabel={`Remove ${item.value}`}
                    >
                      <Truncate
                        content={item.value}
                        maxCharsDisplayed={truncateLength}
                      />
                    </Label>
                  ),
                )}
              </LabelGroup>
            )}
          </TextInputGroupMain>
        </TextInputGroup>
        <ValidatedInputHelperText
          errors={allErrors}
          id={helperTextId}
          helperText={
            <>
              {helperText && `${helperText} `}
              Press Enter or click {hideAddLabel ? 'the add icon' : 'Add'}.
            </>
          }
        />
      </FlexItem>
      <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
        <Button
          variant='control'
          aria-label={addButtonAriaLabel}
          icon={<PlusCircleIcon />}
          onClick={() => addItem(inputValue)}
        >
          {!hideAddLabel && 'Add'}
        </Button>
      </FlexItem>
    </Flex>
  );
};

export default ValidatedListInput;
