import React from 'react';

import { Content } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectKeyboard, selectLanguages } from '@/store/slices';

import { ReviewGroup, ReviewSection } from '../../shared';
import { Hideable } from '../../types';

export const Locale = ({ shouldHide }: Hideable) => {
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  return (
    <ReviewSection
      title='Locale'
      shouldHide={
        shouldHide || (!keyboard && (!languages || languages.length === 0))
      }
    >
      {languages && languages.length > 0 && (
        <ReviewGroup
          heading={languages.length > 1 ? 'Languages' : 'Language'}
          description={languages.map((language, index) => (
            <Content component='p' key={`language-review-${index}`}>
              {language}
            </Content>
          ))}
        />
      )}
      {keyboard && <ReviewGroup heading='Keyboard' description={keyboard} />}
    </ReviewSection>
  );
};
