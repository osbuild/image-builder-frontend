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

const parseLanguageOption = (language: string) => {
  try {
    const [region] = language.split('.');
    const [languageCode, countryCode] = region.split('_');

    const languageName = new Intl.DisplayNames(['en'], {
      type: 'language',
    }).of(languageCode);
    const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(
      countryCode,
    );

    return `${languageName} - ${countryName} (${language})`;
  } catch {
    return language;
  }
};

const LanguagesDropDown = () => {
  const languages = useAppSelector(selectLanguages);
  const dispatch = useAppDispatch();

  const stepValidation = useLocaleValidation();
  const unknownLanguages = stepValidation.errors['unknownLanguages']
    ? stepValidation.errors['unknownLanguages'].split(' ')
    : [];
  const duplicateLanguages = stepValidation.errors['duplicateLanguages']
    ? stepValidation.errors['duplicateLanguages'].split(' ')
    : [];

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<string[]>(languagesList);

  type ParsedLanguages = { [key: string]: string };

  const parsedLanguages = languagesList.reduce((acc, language) => {
    acc[language] = parseLanguageOption(language);
    return acc;
  }, {} as ParsedLanguages);

  useEffect(() => {
    let filteredLanguages = Object.entries(parsedLanguages);

    if (filterValue) {
      filteredLanguages = filteredLanguages.filter(([, parsed]) =>
        String(parsed).toLowerCase().includes(filterValue.toLowerCase()),
      );
      if (!isOpen) {
        setIsOpen(true);
      }
    }
    setSelectOptions(
      filteredLanguages
        .sort((a, b) => sortfn(a[1], b[1], filterValue))
        .map(([raw]) => raw),
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

  const onSelect = (_event?: React.MouseEvent, value?: string | number) => {
    if (value && typeof value === 'string') {
      setInputValue('');
      setFilterValue('');
      if (languages?.includes(value)) {
        dispatch(removeLanguage(value));
      } else {
        dispatch(addLanguage(value));
      }
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
      variant='typeahead'
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete='off'
          placeholder='Select a language'
          isExpanded={isOpen}
        />
        {inputValue && (
          <TextInputGroupUtilities>
            <Button
              icon={<TimesIcon />}
              variant='plain'
              onClick={onClearButtonClick}
              aria-label='Clear input'
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={false} label='Languages'>
      <Select
        isScrollable
        isOpen={isOpen}
        selected={languages}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {selectOptions.length > 0 ? (
            selectOptions.map((option) => (
              <SelectOption key={option} value={option}>
                {parseLanguageOption(option)}
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
            ', ',
          )}`}</HelperTextItem>
        </HelperText>
      )}
      {duplicateLanguages.length > 0 && (
        <HelperText>
          <HelperTextItem
            variant={'error'}
          >{`Duplicated languages: ${duplicateLanguages.join(
            ', ',
          )}`}</HelperTextItem>
        </HelperText>
      )}
      <LabelGroup numLabels={5} className='pf-v6-u-mt-sm pf-v6-u-w-100'>
        {languages?.map((lang) => (
          <Label
            key={lang}
            onClose={(e) => handleRemoveLang(e, lang)}
            isCompact
          >
            {parseLanguageOption(lang)}
          </Label>
        ))}
      </LabelGroup>
    </FormGroup>
  );
};

export default LanguagesDropDown;
