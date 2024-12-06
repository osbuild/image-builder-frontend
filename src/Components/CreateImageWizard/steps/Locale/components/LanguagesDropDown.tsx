import React, { useEffect, useState } from 'react';

import {
  Button,
  Chip,
  ChipGroup,
  FormGroup,
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
import { languagesList } from '../languagesList';

const LanguagesDropDown = () => {
  const languages = useAppSelector(selectLanguages);
  const dispatch = useAppDispatch();

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
      if (!filteredLanguages.length) {
        filteredLanguages = [`No results found for "${filterValue}"`];
      }
      if (!isOpen) {
        setIsOpen(true);
      }
    }
    setSelectOptions(filteredLanguages.sort((a, b) => sortfn(a, b)));

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  const sortfn = (a: string, b: string) => {
    const aLang = a.toLowerCase();
    const bLang = b.toLowerCase();
    // check for languages that start with the search term
    if (aLang.startsWith(filterValue) && !bLang.startsWith(filterValue)) {
      return -1;
    }
    if (bLang.startsWith(filterValue) && !aLang.startsWith(filterValue)) {
      return 1;
    }
    // if both (or neither) start with the search term
    // sort alphabetically
    if (aLang < bLang) {
      return -1;
    }
    if (bLang < aLang) {
      return 1;
    }
    return 0;
  };

  const onToggle = (isOpen: boolean) => {
    setIsOpen(!isOpen);
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      setIsOpen(false);
    }
  };

  const onSelect = (_event: React.MouseEvent, value: string) => {
    if (value && !value.includes('No results')) {
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

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
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
              variant="plain"
              onClick={onClearButtonClick}
              aria-label="Clear input"
            >
              <TimesIcon />
            </Button>
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
        onOpenChange={onToggle}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {selectOptions.map((option) => (
            <SelectOption key={option} value={option}>
              {option}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
      <ChipGroup numChips={5} className="pf-v5-u-mt-sm pf-v5-u-w-100">
        {languages?.map((lang) => (
          <Chip key={lang} onClick={() => dispatch(removeLanguage(lang))}>
            {lang}
          </Chip>
        ))}
      </ChipGroup>
    </FormGroup>
  );
};

export default LanguagesDropDown;
