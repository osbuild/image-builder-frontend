import type {
  ComposerComposesResponseItem,
  ComposerCreateBlueprintRequest,
} from '../../types';

export type BlueprintMigrationStage = 'planning' | 'backup' | 'migration';

export type BlueprintMigrationError = Error & {
  stage: BlueprintMigrationStage;
  backupPath?: string;
};

export type Split = {
  sourceId: string;
  blueprints: { id: string; blueprint: ComposerCreateBlueprintRequest }[];
  composes: {
    id: string;
    blueprintId: string;
    request: ComposerComposesResponseItem['request'];
  }[];
};
