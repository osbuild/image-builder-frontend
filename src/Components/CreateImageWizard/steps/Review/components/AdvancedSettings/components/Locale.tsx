import React from 'react';

import { Content } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectKeyboard, selectLanguages } from '@/store/slices';

import { ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const Locale = ({ shouldHide }: Hideable) => {
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  if (shouldHide || (!keyboard && (!languages || languages.length === 0))) {
    return null;
  }

  return (
    <>
      {languages && languages.length > 0 && (
        <ReviewGroup
          heading='Language'
          description={languages.map((language, index) => (
            <Content component='p' key={`language-review-${index}`}>
              {language}
            </Content>
          ))}
          className={keyboard ? '' : 'pf-v6-u-mb-md'}
        />
      )}
      {keyboard && (
        <ReviewGroup
          heading='Keyboard'
          description={keyboard}
          className='pf-v6-u-mb-md'
        />
      )}
    </>
  );
};
