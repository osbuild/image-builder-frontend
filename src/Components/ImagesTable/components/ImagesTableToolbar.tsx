import React, { useState } from 'react';

import {
  Pagination,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';

import {
  BlueprintItem,
  Distributions,
  GetBlueprintComposesApiArg,
  useGetBlueprintComposesQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
} from '@/store/api/backend';
import {
  selectBlueprintSearchInput,
  selectBlueprintVersionFilterAPI,
  selectSelectedBlueprintId,
} from '@/store/slices/blueprint';
import { selectIsOnPremise } from '@/store/slices/env';

import BlueprintErrorsAlert from './BlueprintErrorsAlert';
import BlueprintVersionAlert from './BlueprintVersionAlert';
import BlueprintWarningAlert from './BlueprintWarningAlert';
import CentOSStream8Alert from './CentOSStream8Alert';

import { useAppSelector } from '../../../store/hooks';
import { BlueprintActionsMenu } from '../../Blueprints/BlueprintActionsMenu';
import BlueprintDiffModal from '../../Blueprints/BlueprintDiffModal';
import BlueprintVersionFilter from '../../Blueprints/BlueprintVersionFilter';
import { BuildImagesButton } from '../../Blueprints/BuildImagesButton';
import { DeleteBlueprintModal } from '../../Blueprints/DeleteBlueprintModal';
import { EditBlueprintButton } from '../../Blueprints/EditBlueprintButton';

type ImagesTableToolbarProps = {
  itemCount: number;
  perPage: number;
  page: number;
  setPage: (page: number) => void;
  onPerPageSelect: (
    event:
      | MouseEvent
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    perPage: number,
  ) => void;
};

const ImagesTableToolbar: React.FC<ImagesTableToolbarProps> = ({
  itemCount,
  perPage,
  page,
  setPage,
  onPerPageSelect,
}: ImagesTableToolbarProps) => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);

  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const blueprintVersionFilterAPI = useAppSelector(
    selectBlueprintVersionFilterAPI,
  );

  const { data: blueprintDetails } = useGetBlueprintQuery(
    { id: selectedBlueprintId! },
    { skip: !selectedBlueprintId },
  );

  const lintWarnings = React.useMemo(
    // there is a mismatch between API type and real data
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    () => blueprintDetails?.lint?.warnings ?? [],
    [blueprintDetails],
  );

  // there is a mismatch between API type and real data
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const hasErrors = !!blueprintDetails?.lint?.errors?.length;
  const hasWarnings = lintWarnings.length > 0;

  const searchParams: GetBlueprintComposesApiArg = {
    id: selectedBlueprintId as string,
    limit: perPage,
    offset: perPage * (page - 1),
  };

  if (blueprintVersionFilterAPI) {
    searchParams.blueprintVersion = blueprintVersionFilterAPI;
  }

  const {
    data: blueprintsComposes,
    isFetching: isFetchingBlueprintsCompose,
    isSuccess: isSuccessBlueprintsCompose,
  } = useGetBlueprintComposesQuery(searchParams, {
    skip: !selectedBlueprintId,
  });

  const { selectedBlueprintName, selectedBlueprintVersion } =
    useGetBlueprintsQuery(
      { search: blueprintSearchInput as string },
      {
        selectFromResult: ({ data }) => {
          const bp = data?.data.find(
            (blueprint: BlueprintItem) => blueprint.id === selectedBlueprintId,
          );
          return {
            selectedBlueprintName: bp?.name,
            selectedBlueprintVersion: bp?.version,
          };
        },
      },
    );

  const latestImageVersion = blueprintsComposes?.data[0]?.blueprint_version;

  const isBlueprintOutSync =
    selectedBlueprintId &&
    !isFetchingBlueprintsCompose &&
    latestImageVersion !== selectedBlueprintVersion;

  const pagination = (
    <Pagination
      itemCount={itemCount}
      perPage={perPage}
      page={page}
      onSetPage={(_, page) => setPage(page)}
      onPerPageSelect={onPerPageSelect}
      widgetId='compose-pagination-top'
      data-testid='images-pagination-top'
      isCompact
    />
  );

  const isBlueprintDistroCentos8 = () => {
    if (isSuccessBlueprintsCompose) {
      return (
        blueprintsComposes.data[0].request.distribution ===
        ('centos-8' as Distributions)
      );
    }
  };

  return (
    <>
      <DeleteBlueprintModal
        setShowDeleteModal={setShowDeleteModal}
        isOpen={showDeleteModal}
      />
      {itemCount > 0 && isBlueprintOutSync && (
        <BlueprintDiffModal
          baseVersion={latestImageVersion}
          blueprintName={selectedBlueprintName}
          isOpen={showDiffModal}
          onClose={() => setShowDiffModal(false)}
        />
      )}
      <Toolbar>
        <ToolbarContent>
          <Title headingLevel='h2'>
            {selectedBlueprintName
              ? `${selectedBlueprintName} images`
              : 'All images'}
          </Title>
        </ToolbarContent>
        {hasErrors && (
          <BlueprintErrorsAlert
            selectedBlueprintId={selectedBlueprintId}
            blueprintDetails={blueprintDetails}
          />
        )}
        {selectedBlueprintId && hasWarnings && (
          <BlueprintWarningAlert lintWarnings={lintWarnings} />
        )}
        {!isOnPremise && itemCount > 0 && isBlueprintOutSync && (
          <BlueprintVersionAlert
            selectedBlueprintVersion={selectedBlueprintVersion}
            latestImageVersion={latestImageVersion}
            setShowDiffModal={setShowDiffModal}
          />
        )}{' '}
        {blueprintsComposes &&
          blueprintsComposes.data.length > 0 &&
          isBlueprintDistroCentos8() && <CentOSStream8Alert />}
        <ToolbarContent>
          {selectedBlueprintId && (
            <>
              <ToolbarItem>
                <BlueprintVersionFilter onFilterChange={() => setPage(1)} />
              </ToolbarItem>
              <ToolbarItem>
                <BuildImagesButton />
              </ToolbarItem>
              <ToolbarItem>
                <EditBlueprintButton />
              </ToolbarItem>
              <ToolbarItem>
                <BlueprintActionsMenu setShowDeleteModal={setShowDeleteModal} />
              </ToolbarItem>
            </>
          )}
          <ToolbarItem variant='pagination' align={{ default: 'alignEnd' }}>
            {pagination}
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </>
  );
};

export default ImagesTableToolbar;
