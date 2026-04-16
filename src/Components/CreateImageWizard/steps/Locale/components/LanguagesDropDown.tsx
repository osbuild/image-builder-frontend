import React, { useMemo, useState } from 'react';

import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import {
  addLanguage,
  removeLanguage,
  replaceLanguage,
  selectLanguages,
} from '@/store/slices/wizard';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import SearchableSelect from '../../../../sharedComponents/SearchableSelect';
import { useLocaleValidation } from '../../../utilities/useValidation';
import { languagesList } from '../data/languagesList';

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

const parsedLanguages: Record<string, string> = Object.fromEntries(
  languagesList.map((lang) => [lang, parseLanguageOption(lang)]),
);

type LanguageRowProps = {
  selectedLanguage?: string;
  onSelect: (language: string | undefined) => void;
  onRemove: () => void;
  existingLanguages: string[];
};

const LanguageRow = ({
  selectedLanguage,
  onSelect,
  onRemove,
  existingLanguages,
}: LanguageRowProps) => {
  const options = useMemo(
    () =>
      Object.entries(parsedLanguages)
        .filter(
          ([raw]) =>
            !existingLanguages.includes(raw) || raw === selectedLanguage,
        )
        .map(([raw, parsed]) => ({ value: raw, label: parsed })),
    [existingLanguages, selectedLanguage],
  );

  return (
    <div className='pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-gap-sm pf-v6-u-mb-sm'>
      <div style={{ width: '50%' }}>
        <SearchableSelect
          options={options}
          selected={selectedLanguage}
          placeholder='Select a language'
          onSelect={onSelect}
          isFullWidth
        />
      </div>
      <Button
        variant='plain'
        onClick={onRemove}
        aria-label={
          selectedLanguage
            ? `Remove language ${selectedLanguage}`
            : 'Remove language'
        }
        icon={<MinusCircleIcon />}
      />
    </div>
  );
};

const LanguagesDropDown = () => {
  const languages = useAppSelector(selectLanguages) ?? [];
  const dispatch = useAppDispatch();
  const [showNewRow, setShowNewRow] = useState(false);

  const stepValidation = useLocaleValidation();
  const unknownLanguages = stepValidation.errors['unknownLanguages']
    ? stepValidation.errors['unknownLanguages'].split(' ')
    : [];
  const duplicateLanguages = stepValidation.errors['duplicateLanguages']
    ? stepValidation.errors['duplicateLanguages'].split(' ')
    : [];

  const handleSelectNewLanguage = (language: string | undefined) => {
    if (language) {
      dispatch(addLanguage(language));
      setShowNewRow(false);
    }
  };

  const handleChangeLanguage = (
    oldLang: string,
    newLang: string | undefined,
  ) => {
    if (newLang) {
      dispatch(replaceLanguage({ oldLanguage: oldLang, newLanguage: newLang }));
    }
  };

  const handleRemoveLanguage = (language: string) => {
    dispatch(removeLanguage(language));
  };

  return (
    <FormGroup isRequired={false} label='Languages' role='group'>
      {languages.map((lang) => (
        <LanguageRow
          key={lang}
          selectedLanguage={lang}
          onSelect={(newLang) => handleChangeLanguage(lang, newLang)}
          onRemove={() => handleRemoveLanguage(lang)}
          existingLanguages={languages}
        />
      ))}
      {showNewRow && (
        <LanguageRow
          onSelect={handleSelectNewLanguage}
          onRemove={() => setShowNewRow(false)}
          existingLanguages={languages}
        />
      )}
      <HelperText>
        <HelperTextItem>Search by country, language or UTF code</HelperTextItem>
      </HelperText>
      {unknownLanguages.length > 0 && (
        <HelperText>
          <HelperTextItem variant='error'>{`Unknown languages: ${unknownLanguages.join(
            ', ',
          )}`}</HelperTextItem>
        </HelperText>
      )}
      {duplicateLanguages.length > 0 && (
        <HelperText>
          <HelperTextItem variant='error'>{`Duplicated languages: ${duplicateLanguages.join(
            ', ',
          )}`}</HelperTextItem>
        </HelperText>
      )}
      <Button
        className='pf-v6-u-text-align-left pf-v6-u-mt-sm'
        variant='link'
        icon={<PlusCircleIcon />}
        onClick={() => setShowNewRow(true)}
        isDisabled={showNewRow}
      >
        Add language
      </Button>
    </FormGroup>
  );
};

export default LanguagesDropDown;
