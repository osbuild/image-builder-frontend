export type WizardModeOptions = 'create' | 'edit';

export type BlueprintModeOptions = 'image' | 'package';

type Blueprint = {
  name: string;
  isCustomName: boolean;
  description: string;
  mode: BlueprintModeOptions;
};

type Metadata = {
  parent_id: string | null;
  exported_at: string;
  is_on_prem: boolean;
};

export type DetailsSlice = {
  blueprintId?: string;
  mode: WizardModeOptions;
  blueprint: Blueprint;
  metadata?: Metadata | undefined;
};
