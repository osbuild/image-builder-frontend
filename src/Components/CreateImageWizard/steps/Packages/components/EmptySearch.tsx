import React from 'react';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { Tbody, Td, Tr } from '@patternfly/react-table';

type EmptySearchProps = {
  toggleSelected: string;
};

const EmptySearch = ({ toggleSelected }: EmptySearchProps) => {
  return (
    <Tbody>
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            {toggleSelected === 'toggle-available' ? (
              <EmptyState
                headingLevel='h4'
                titleText='Search packages'
                icon={SearchIcon}
                variant={EmptyStateVariant.sm}
              >
                <EmptyStateBody>
                  Search for additional packages to add to your image
                </EmptyStateBody>
              </EmptyState>
            ) : (
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
            )}
          </Bullseye>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default EmptySearch;
