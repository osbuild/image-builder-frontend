import React, { useEffect, useState } from 'react';

import {
  Alert,
  AlertActionLink,
  ExpandableSection,
  List,
  ListItem,
  Pagination,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';

import { useFixupBPWithNotification as useFixupBlueprintMutation } from '../../Hooks';
import {
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
} from '../../store/backendApi';
import {
  selectBlueprintSearchInput,
  selectBlueprintVersionFilterAPI,
  selectSelectedBlueprintId,
} from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintItem,
  Distributions,
  GetBlueprintComposesApiArg,
  useGetBlueprintComposesQuery,
} from '../../store/imageBuilderApi';
import { BlueprintActionsMenu } from '../Blueprints/BlueprintActionsMenu';
import BlueprintDiffModal from '../Blueprints/BlueprintDiffModal';
import BlueprintVersionFilter from '../Blueprints/BlueprintVersionFilter';
import { BuildImagesButton } from '../Blueprints/BuildImagesButton';
import { DeleteBlueprintModal } from '../Blueprints/DeleteBlueprintModal';
import { EditBlueprintButton } from '../Blueprints/EditBlueprintButton';

interface imagesTableToolbarProps {
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
}

const ImagesTableToolbar: React.FC<imagesTableToolbarProps> = ({
  itemCount,
  perPage,
  page,
  setPage,
  onPerPageSelect,
}: imagesTableToolbarProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const blueprintVersionFilterAPI = useAppSelector(
    selectBlueprintVersionFilterAPI,
  );

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
        blueprintsComposes?.data[0].request.distribution ===
        ('centos-8' as Distributions)
      );
    }
  };

  const { data: blueprintDetails } = useGetBlueprintQuery(
    { id: selectedBlueprintId! },
    { skip: !selectedBlueprintId },
  );

  const { trigger: fixupBlueprint } = useFixupBlueprintMutation();
  const [isLintExp, setIsLintExp] = React.useState(true);
  const [showWarnings, setShowWarnings] = React.useState(true);

  const onToggleLintExp = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsLintExp(isExpanded);
  };

  const [warningsToShow, setWarningsToShow] = useState<
    { name: string; description: string }[]
  >([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Update warnings when blueprint changes or warnings are ignored
  useEffect(() => {
    // Get list of warnings that were ignored
    const getIgnoredWarnings = () => {
      if (!selectedBlueprintId) return [];

      const ignoreKey = `blueprint-warnings-ignored-${selectedBlueprintId}`;
      const ignored = localStorage.getItem(ignoreKey);

      if (!ignored) return [];

      try {
        const { ignoredWarnings } = JSON.parse(ignored);
        return ignoredWarnings || [];
      } catch {
        return [];
      }
    };

    // Get warnings that should be shown (not ignored)
    const getWarningsToShow = () => {
      if (!blueprintDetails?.lint.errors.length) return [];

      const ignoredWarnings = getIgnoredWarnings();

      return blueprintDetails.lint.errors.filter(
        (error) =>
          !ignoredWarnings.some(
            (ignored: { name: string; description: string }) =>
              ignored.name === error.name &&
              ignored.description === error.description,
          ),
      );
    };

    setWarningsToShow(getWarningsToShow());
  }, [blueprintDetails?.lint.errors, selectedBlueprintId, refreshTrigger]);

  const shouldShowWarnings = warningsToShow.length > 0;
  const hasErrors = shouldShowWarnings;

  // Handle ignoring current visible warnings
  const handleIgnoreWarnings = () => {
    if (!selectedBlueprintId || !warningsToShow.length) return;

    const ignoreKey = `blueprint-warnings-ignored-${selectedBlueprintId}`;

    // Get existing ignored warnings
    const ignored = localStorage.getItem(ignoreKey);
    let existingIgnored = [];
    if (ignored) {
      try {
        const { ignoredWarnings } = JSON.parse(ignored);
        existingIgnored = ignoredWarnings || [];
      } catch {
        // ignore parsing errors
      }
    }

    // Add current visible warnings to ignored list
    const newIgnoredWarnings = [
      ...existingIgnored,
      ...warningsToShow.map((warning) => ({
        name: warning.name,
        description: warning.description,
      })),
    ];

    localStorage.setItem(
      ignoreKey,
      JSON.stringify({
        timestamp: Date.now(),
        ignoredWarnings: newIgnoredWarnings,
      }),
    );

    // Trigger useEffect to re-calculate warnings
    setRefreshTrigger((prev) => prev + 1);
    setShowWarnings(false);
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
        {hasErrors && shouldShowWarnings && showWarnings && (
          <Alert
            variant='warning'
            style={{
              margin:
                '0 var(--pf6-c-toolbar__content--PaddingRight) 0 var(--pf-v6-c-toolbar__content--PaddingLeft)',
            }}
            isInline
            title={`The selected blueprint has warnings.`}
            actionLinks={[
              <AlertActionLink
                key='fix'
                onClick={async () => {
                  await fixupBlueprint({ id: selectedBlueprintId! });
                }}
                id='blueprint_fix_warnings_automatically'
              >
                Fix warnings automatically (updates the blueprint)
              </AlertActionLink>,
              <AlertActionLink
                key='ignore'
                onClick={handleIgnoreWarnings}
                id='blueprint_ignore_warnings'
              >
                Ignore all warnings
              </AlertActionLink>,
            ]}
          >
            <ExpandableSection
              toggleText={isLintExp ? 'Show less' : 'Show more'}
              onToggle={onToggleLintExp}
              isExpanded={isLintExp}
            >
              <List isPlain>
                {warningsToShow.map((err) => (
                  <ListItem key={err.description}>
                    {err.name}: {err.description}
                  </ListItem>
                ))}
              </List>
            </ExpandableSection>
          </Alert>
        )}
        {itemCount > 0 && isBlueprintOutSync && (
          <Alert
            style={{
              margin:
                '0 var(--pf-v6-c-toolbar__content--PaddingRight) 0 var(--pf-v6-c-toolbar__content--PaddingLeft)',
            }}
            isInline
            title={`The selected blueprint is at version ${selectedBlueprintVersion}, the latest images are at version ${latestImageVersion}. Build images to synchronize with the latest version.`}
            actionLinks={
              <AlertActionLink
                onClick={() => setShowDiffModal(true)}
                id='blueprint_view_version_difference'
              >
                View the difference
              </AlertActionLink>
            }
          />
        )}{' '}
        {blueprintsComposes &&
          blueprintsComposes.data.length > 0 &&
          isBlueprintDistroCentos8() && (
            <Alert
              style={{
                margin:
                  '0 var(--pf-v6-c-toolbar__content--PaddingRight) 0 var(--pf-v6-c-toolbar__content--PaddingLeft)',
              }}
              isInline
              variant='warning'
              title='CentOS Stream 8 is no longer supported, building images from this blueprint will fail. Edit blueprint to update the release to CentOS Stream 9.'
            />
          )}
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
