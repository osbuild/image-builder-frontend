export type VersionFilterType = 'latest' | 'all';

export type BlueprintsState = {
  selectedBlueprintId: string | undefined;
  searchInput: string | undefined;
  offset: number;
  limit: number;
  versionFilter: VersionFilterType;
};
