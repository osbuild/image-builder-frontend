import React from 'react';

import {
  Alert,
  AlertActionLink,
  ExpandableSection,
  List,
  ListItem,
} from '@patternfly/react-core';

import { BlueprintResponse } from '@/store/api/backend';

import { useFixupBPWithNotification as useFixupBlueprintMutation } from '../../../Hooks';

type BlueprintErrorsAlertProps = {
  selectedBlueprintId: string | undefined;
  blueprintDetails: BlueprintResponse;
};

const BlueprintErrorsAlert = ({
  selectedBlueprintId,
  blueprintDetails,
}: BlueprintErrorsAlertProps) => {
  const { trigger: fixupBlueprint } = useFixupBlueprintMutation();

  const [isLintExp, setIsLintExp] = React.useState(true);
  const onToggleLintExp = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsLintExp(isExpanded);
  };

  return (
    <Alert
      variant='warning'
      isInline
      title='The selected blueprint has compliance errors that can be automatically fixed, action required.'
      actionLinks={[
        <AlertActionLink
          key='fix'
          onClick={async () => {
            await fixupBlueprint({ id: selectedBlueprintId! });
          }}
          id='blueprint_fix_errors_automatically'
        >
          Fix errors automatically (updates the blueprint)
        </AlertActionLink>,
      ]}
    >
      <ExpandableSection
        toggleText={isLintExp ? 'Show less' : 'Show more'}
        onToggle={onToggleLintExp}
        isExpanded={isLintExp}
      >
        <List isPlain>
          {blueprintDetails.lint.errors.map((err) => (
            <ListItem key={err.description}>
              {err.name}: {err.description}
            </ListItem>
          ))}
        </List>
      </ExpandableSection>
    </Alert>
  );
};

export default BlueprintErrorsAlert;
