import React from 'react';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { Tbody, Td, Tr } from '@patternfly/react-table';

const TooShort = () => {
  return (
    <Tbody>
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState
              headingLevel='h4'
              icon={SearchIcon}
              titleText='The search value is too short'
              variant={EmptyStateVariant.sm}
            >
              <EmptyStateBody>
                Please make the search more specific and try again.
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default TooShort;
