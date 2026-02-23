import React from 'react';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Spinner,
} from '@patternfly/react-core';
import { Tbody, Td, Tr } from '@patternfly/react-table';

import { Repos } from '../packagesTypes';

type SearchingProps = {
  activeTabKey: Repos;
};

const Searching = ({ activeTabKey }: SearchingProps) => {
  return (
    <Tbody>
      <Tr>
        <Td colSpan={5}>
          <Bullseye>
            <EmptyState icon={Spinner} variant={EmptyStateVariant.sm}>
              <EmptyStateBody>
                {activeTabKey === Repos.OTHER
                  ? 'Searching for recommendations'
                  : 'Searching'}
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default Searching;
