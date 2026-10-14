import React from 'react';

import { Content } from '@patternfly/react-core';

import {
  ReviewGroup,
  ReviewSection,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { useAppSelector } from '@/store/hooks';
import { selectKeyboard, selectLanguages } from '@/store/slices';

export const Locale = () => {
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  return (
    <ReviewSection title='Locale'>
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
