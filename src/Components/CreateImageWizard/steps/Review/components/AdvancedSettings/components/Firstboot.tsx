import React, { useState } from 'react';

import {
  CodeBlock,
  CodeBlockCode,
  ExpandableSection,
} from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectFirstBootScript } from '@/store/slices';

import { ReviewGroup, ReviewSection } from '../../shared';
import { Hideable } from '../../types';

const MAX_LINES = 8;

export const Firstboot = ({ shouldHide }: Hideable) => {
  const script = useAppSelector(selectFirstBootScript);
  const [isExpanded, setIsExpanded] = useState(false);

  if (shouldHide || !script) {
    return null;
  }

  const lines = script.split('\n');
  const needsTruncation = lines.length > MAX_LINES;
  const displayedScript = needsTruncation
    ? lines.slice(0, MAX_LINES).join('\n')
    : script;

  return (
    <ReviewSection title='First boot configuration'>
      <ReviewGroup
        heading='Custom script'
        description={
          <CodeBlock>
            <CodeBlockCode>{displayedScript}</CodeBlockCode>
            {needsTruncation && (
              <ExpandableSection
                toggleText={isExpanded ? 'Show less' : 'Show more'}
                isExpanded={isExpanded}
                onToggle={(_event, expanded) => setIsExpanded(expanded)}
              >
                <CodeBlockCode>
                  {lines.slice(MAX_LINES).join('\n')}
                </CodeBlockCode>
              </ExpandableSection>
            )}
          </CodeBlock>
        }
      />
    </ReviewSection>
  );
};
