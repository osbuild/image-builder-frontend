import React, { useEffect, useState } from 'react';

import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addLanguage,
  removeLanguage,
  selectLanguages,
} from '../../../../../store/wizardSlice';
import sortfn from '../../../../../Utilities/sortfn';
import { useLocaleValidation } from '../../../utilities/useValidation';
import { languagesList } from '../languagesList';

const LanguagesDropDown = () => {
  const languages = useAppSelector(selectLanguages);
  const dispatch = useAppDispatch();

  const stepValidation = useLocaleValidation();
  const unknownLanguages = stepValidation.errors['languages']
    ? stepValidation.errors['languages'].split(' ')
    : [];

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<string[]>(languagesList);

  useEffect(() => {
    let filteredLanguages = languagesList;

    if (filterValue) {
      filteredLanguages = languagesList.filter((language: string) =>
        String(language).toLowerCase().includes(filterValue.toLowerCase())
      );
      if (!isOpen) {
        setIsOpen(true);
      }
    }
    setSelectOptions(
      filteredLanguages.sort((a, b) => sortfn(a, b, filterValue))
    );

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      setIsOpen(false);
    }
  };

  const onSelect = (_event: React.MouseEvent, value: string) => {
    if (value) {
      setInputValue('');
      setFilterValue('');
      dispatch(addLanguage(value));
      setIsOpen(false);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onClearButtonClick = () => {
    setInputValue('');
    setFilterValue('');
  };

  const handleRemoveLang = (_event: React.MouseEvent, value: string) => {
    dispatch(removeLanguage(value));
    if (unknownLanguages.length > 0) {
      unknownLanguages.filter((lang) => lang !== value);
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete="off"
          placeholder="Select a language"
          isExpanded={isOpen}
        />
        {inputValue && (
          <TextInputGroupUtilities>
            <Button
              icon={<TimesIcon />}
              variant="plain"
              onClick={onClearButtonClick}
              aria-label="Clear input"
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={false} label="Languages">
      <Select
        isScrollable
        isOpen={isOpen}
        selected={inputValue}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {selectOptions.length > 0 ? (
            selectOptions.map((option) => (
              <SelectOption
                key={option}
                value={option}
                isDisabled={languages?.includes(option) || false}
                description={
                  languages?.includes(option) && 'Language already added'
                }
              >
                {option}
              </SelectOption>
            ))
          ) : (
            <SelectOption isDisabled>
              {`No results found for "${filterValue}"`}
            </SelectOption>
          )}
        </SelectList>
      </Select>
      {unknownLanguages.length > 0 && (
        <HelperText>
          <HelperTextItem
            variant={'error'}
          >{`Unknown languages: ${unknownLanguages.join(
            ', '
          )}`}</HelperTextItem>
        </HelperText>
      )}
      <LabelGroup numLabels={5} className="pf-v5-u-mt-sm pf-v5-u-w-100">
        {languages?.map((lang) => (
          <Label key={lang} onClose={(e) => handleRemoveLang(e, lang)}>
            {lang}
          </Label>
        ))}
      </LabelGroup>
    </FormGroup>
  );
};

export default LanguagesDropDown;
