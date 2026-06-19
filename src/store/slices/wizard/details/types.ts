export type WizardModeOptions = 'create' | 'edit';

export type BlueprintModeOptions = 'image' | 'package';

export type DetailsSlice = {
  blueprintId?: string;
  mode: WizardModeOptions;
  blueprint: {
    name: string;
    isCustomName: boolean;
    description: string;
    mode: BlueprintModeOptions;
  };
  metadata?: {
    parent_id: string | null;
    exported_at: string;
    is_on_prem: boolean;
  };
};
