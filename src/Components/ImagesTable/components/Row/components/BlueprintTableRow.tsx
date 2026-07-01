import React, { useState } from 'react';

import {
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  Spinner,
} from '@patternfly/react-core';
import { RhUiResourcesEmptyIcon } from '@patternfly/react-icons';
import {
  ActionsColumn,
  ExpandableRowContent,
  Tbody,
  Td,
  Tr,
} from '@patternfly/react-table';

import { BlueprintItem } from '@/store/api/backend';
import { selectSelectedBlueprintId } from '@/store/slices/blueprint';
import {
  timestampToDisplayString,
  timestampToDisplayStringDetailed,
} from '@/Utilities/time';

import { useDeleteBPWithNotification as useDeleteBlueprintMutation } from '../../../../../Hooks';
import { useAppSelector } from '../../../../../store/hooks';
import Status from '../../Status/components/Status';

type BlueprintTableRowProps = {
  blueprint: BlueprintItem;
  rowIndex: number;
};

const BlueprintTableRow = ({ blueprint, rowIndex }: BlueprintTableRowProps) => {
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const [isExpanded, setIsExpanded] = useState(false);

  const { isLoading } = useDeleteBlueprintMutation({
    fixedCacheKey: 'delete-blueprint',
  });

  const handleToggle = () => setIsExpanded(!isExpanded);

  return (
    <Tbody key={blueprint.id} isExpanded={isExpanded}>
      <Tr
        className='no-bottom-border'
        isClickable
        isRowSelected={blueprint.id === selectedBlueprintId}
      >
        <Td
          expand={{
            rowIndex: rowIndex,
            isExpanded: isExpanded,
            onToggle: handleToggle,
          }}
        />
        <Td dataLabel='Name'>
          {isLoading && blueprint.id === selectedBlueprintId && (
            <Spinner size='md' />
          )}
          {blueprint.name}{' '}
          <Label isCompact color='blue'>
            Blueprint
          </Label>
        </Td>
        <Td
          dataLabel='Last updated'
          title={
            blueprint.last_modified_at
              ? timestampToDisplayStringDetailed(blueprint.last_modified_at)
              : undefined
          }
        >
          {blueprint.last_modified_at
            ? timestampToDisplayString(blueprint.last_modified_at)
            : 'N/A'}
        </Td>
        <Td dataLabel='Operating system'>N/A</Td>
        <Td dataLabel='Target environment'>N/A</Td>
        <Td dataLabel='Status'>
          <Status
            icon={<RhUiResourcesEmptyIcon />}
            text={
              <span className='pf-v6-u-font-weight-bold'>No images built</span>
            }
          />
        </Td>
        <Td dataLabel='Instance'>N/A</Td>
        <Td>
          <ActionsColumn
            items={[
              {
                title: 'Edit',
                onClick: () => {},
              },
              {
                title: 'Duplicate',
                onClick: () => {},
              },
              {
                title: 'Rebuild',
                onClick: () => {},
              },
            ]}
          />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={8}>
          <ExpandableRowContent>
            <div className='pf-v6-u-font-weight-bold pf-v6-u-pb-md'>
              Blueprint Information
            </div>
            <DescriptionList isHorizontal isCompact className=' pf-v6-u-pl-xl'>
              <DescriptionListGroup>
                <DescriptionListTerm>UUID</DescriptionListTerm>
                <DescriptionListDescription>
                  <ClipboardCopy
                    hoverTip='Copy'
                    clickTip='Copied'
                    variant='inline-compact'
                  >
                    {blueprint.id}
                  </ClipboardCopy>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Description</DescriptionListTerm>
                <DescriptionListDescription>
                  {blueprint.description || 'N/A'}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default BlueprintTableRow;
