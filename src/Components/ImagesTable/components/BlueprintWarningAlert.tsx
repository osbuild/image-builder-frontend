import React, { useState } from 'react';

import {
  Alert,
  ExpandableSection,
  List,
  ListItem,
} from '@patternfly/react-core';

import { BlueprintLintItem } from '@/store/api/backend';

type BlueprintWarningAlertProps = {
  lintWarnings: BlueprintLintItem[];
};

const BlueprintWarningAlert = ({
  lintWarnings,
}: BlueprintWarningAlertProps) => {
  const [warningExpanded, setWarningExpanded] = useState(true);

  return (
    <Alert
      variant='info'
      isInline
      title='The selected blueprint has compliance warnings, no action required.'
    >
      <ExpandableSection
        toggleText={warningExpanded ? 'Show less' : 'Show more'}
        onToggle={(_, isExpanded) => setWarningExpanded(isExpanded)}
        isExpanded={warningExpanded}
      >
        <List isPlain>
          {lintWarnings.map((warning) => (
            <ListItem key={warning.name}>
              {warning.name}: {warning.description}
            </ListItem>
          ))}
        </List>
      </ExpandableSection>
    </Alert>
  );
};

export default BlueprintWarningAlert;
