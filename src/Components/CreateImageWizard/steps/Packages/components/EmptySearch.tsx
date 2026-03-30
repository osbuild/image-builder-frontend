import React from 'react';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { Tbody, Td, Tr } from '@patternfly/react-table';

const EmptySearch = () => {
  return (
    <Tbody>
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState
              headingLevel='h4'
              titleText='There are no selected packages'
              icon={SearchIcon}
              variant={EmptyStateVariant.sm}
            >
              <EmptyStateBody>
                Search above to see available packages
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default EmptySearch;
