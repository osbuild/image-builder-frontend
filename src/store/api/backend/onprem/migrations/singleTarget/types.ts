import { ComposerCreateBlueprintRequest } from '../../types';

export type Split = {
  sourceId: string;
  blueprints: { id: string; blueprint: ComposerCreateBlueprintRequest }[];
  composes: { id: string; blueprintId: string }[];
};
