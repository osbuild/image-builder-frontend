import React, { useMemo, useState } from 'react';

import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import ValidatedInputHelperText from '@/Components/CreateImageWizard/ValidatedInputHelperText';
import SearchableSelect from '@/Components/sharedComponents/SearchableSelect';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addLanguage,
  removeLanguage,
  replaceLanguage,
  selectLanguages,
  languages as supportedLanguages,
  validateLanguages,
} from '@/store/slices/wizard';

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
  supportedLanguages.map((lang) => [lang, parseLanguageOption(lang)]),
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
  const dispatch = useAppDispatch();
  const [showNewRow, setShowNewRow] = useState(false);
  const languages = useAppSelector(selectLanguages) ?? [];
  const errors = validateLanguages(languages);

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
    if (languages.length <= 1) {
      setShowNewRow(true);
    }
  };

  return (
    <FormGroup isRequired={false} label='Languages' role='group'>
      {languages.map((lang, index) => {
        const occurrenceIndex = languages
          .slice(0, index)
          .filter((l) => l === lang).length;
        return (
          <LanguageRow
            key={`${lang}-${occurrenceIndex}`}
            selectedLanguage={lang}
            onSelect={(newLang) => handleChangeLanguage(lang, newLang)}
            onRemove={() => handleRemoveLanguage(lang)}
            existingLanguages={languages}
          />
        );
      })}
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
      <ValidatedInputHelperText errors={errors} />
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
