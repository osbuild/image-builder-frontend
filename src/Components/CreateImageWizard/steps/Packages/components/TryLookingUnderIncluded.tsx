import React from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { Tbody, Td, Tr } from '@patternfly/react-table';

import { Repos } from '../packagesTypes';

type TryLookingUnderIncludedProps = {
  setActiveTabKey: (value: Repos) => void;
};

const TryLookingUnderIncluded = ({
  setActiveTabKey,
}: TryLookingUnderIncludedProps) => {
  return (
    <Tbody>
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState
              headingLevel='h4'
              titleText='No selected packages in Other repos'
              variant={EmptyStateVariant.sm}
            >
              <EmptyStateBody>
                Try looking under &quot;
                <Button
                  variant='link'
                  onClick={() => setActiveTabKey(Repos.INCLUDED)}
                  isInline
                >
                  Included repos
                </Button>
                &quot;.
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default TryLookingUnderIncluded;
