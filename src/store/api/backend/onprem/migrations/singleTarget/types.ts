import type {
  ComposerComposesResponseItem,
  ComposerCreateBlueprintRequest,
} from '../../types';

export type BlueprintMigrationError = Error & { backupPath: string };

export type Split = {
  sourceId: string;
  blueprints: { id: string; blueprint: ComposerCreateBlueprintRequest }[];
  composes: {
    id: string;
    blueprintId: string;
    request: ComposerComposesResponseItem['request'];
  }[];
};
