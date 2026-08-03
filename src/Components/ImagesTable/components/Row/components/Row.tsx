import React, { useState } from 'react';

import { Badge, Button, Label } from '@patternfly/react-core';
import {
  ActionsColumn,
  ExpandableRowContent,
  Tbody,
  Td,
  Tr,
} from '@patternfly/react-table';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useDispatch } from 'react-redux';

import { useCockpitMachinesAvailable, useGetUser } from '@/Hooks';
import {
  BlueprintItem,
  ComposesResponseItem,
  LocalUploadStatus,
  useGetComposeStatusQuery,
} from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  selectSelectedBlueprintId,
  setBlueprintId,
} from '@/store/slices/blueprint';
import { selectIsOnPremise } from '@/store/slices/env';
import { hasBootcRequest } from '@/store/typeGuards';
import { bootcReferenceToOSDisplayLabel } from '@/Utilities/distributionToOSShortId';
import {
  timestampToDisplayString,
  timestampToDisplayStringDetailed,
} from '@/Utilities/time';
import { useFlag } from '@/Utilities/useGetEnvironment';

import Release from '../../Release';
import { Target } from '../../Target';
import { defaultActions } from '../defaultActions';

type RowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  status: JSX.Element;
  target?: JSX.Element;
  actions?: JSX.Element;
  instance: JSX.Element;
  details: JSX.Element;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

const Row = ({
  compose,
  rowIndex,
  status,
  target,
  actions,
  details,
  instance,
  onSelect,
  isSelected,
}: RowPropTypes) => {
  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isMachinesAvailable = useCockpitMachinesAvailable();

  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggle = () => setIsExpanded(!isExpanded);
  const dispatch = useDispatch();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const bootcCompose = hasBootcRequest(compose) ? compose : undefined;

  const isImagesTableRevampEnabled = useFlag(
    'image-builder.images-table-revamp.enabled',
  );

  const { data } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  const options = data?.image_status.upload_status?.options as unknown as
    | LocalUploadStatus
    | undefined;

  const handleClick = ({
    blueprintId,
  }: {
    blueprintId: BlueprintItem['id'];
  }) => {
    if (blueprintId) {
      dispatch(setBlueprintId(blueprintId));
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(compose.id);
    }
  };

  return (
    <Tbody key={compose.id} isExpanded={isExpanded}>
      <Tr className='no-bottom-border'>
        <Td
          expand={{
            rowIndex: rowIndex,
            isExpanded: isExpanded,
            onToggle: () => handleToggle(),
          }}
        />
        {isImagesTableRevampEnabled && (
          <Td
            select={{
              rowIndex: rowIndex,
              onSelect: handleSelect,
              isSelected: isSelected || false,
            }}
          />
        )}
        <Td dataLabel='Image name'>
          {!isImagesTableRevampEnabled &&
          compose.blueprint_id &&
          !selectedBlueprintId ? (
            <Button
              component='a'
              variant='link'
              isInline
              onClick={() =>
                compose.blueprint_id &&
                handleClick({ blueprintId: compose.blueprint_id })
              }
            >
              {compose.image_name || compose.id}
            </Button>
          ) : (
            <span>{compose.image_name || compose.id}</span>
          )}{' '}
          {compose.blueprint_id &&
            (bootcCompose?.request.bootc ? (
              <Label isCompact color='yellow'>
                Image mode
              </Label>
            ) : (
              <Label isCompact color='teal'>
                Package mode
              </Label>
            ))}
        </Td>
        <Td
          dataLabel='Created'
          title={timestampToDisplayStringDetailed(compose.created_at)}
        >
          {timestampToDisplayString(compose.created_at)}
        </Td>
        <Td dataLabel='Release'>
          {compose.request.distribution ? (
            <Release release={compose.request.distribution} />
          ) : (
            <p>
              {bootcCompose?.request.bootc?.reference &&
                bootcReferenceToOSDisplayLabel(
                  bootcCompose.request.bootc.reference,
                )}
            </p>
          )}
        </Td>
        <Td dataLabel='Target'>
          {target ? target : <Target compose={compose} />}
        </Td>
        {!isOnPremise && !isImagesTableRevampEnabled && (
          <Td dataLabel='Version'>
            <Badge isRead>{compose.blueprint_version || 'N/A'}</Badge>
          </Td>
        )}
        <Td dataLabel='Status'>{status}</Td>
        <Td dataLabel='Instance'>{instance}</Td>
        <Td>
          {actions ? (
            actions
          ) : (
            <ActionsColumn
              items={defaultActions(
                compose,
                analytics,
                userData?.identity.internal?.account_id,
                isOnPremise,
                options,
                isMachinesAvailable,
              )}
            />
          )}
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={isImagesTableRevampEnabled ? 9 : 8}>
          <ExpandableRowContent>{details}</ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default Row;
