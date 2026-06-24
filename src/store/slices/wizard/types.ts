import { CloudProviderSlice } from './cloud';
import { ComplianceSlice } from './compliance';
import { ContentSlice } from './content';
import { DetailsSlice } from './details';
import { FilesystemSlice } from './filesystem';
import { OutputSlice } from './output';
import { RegistrationSlice } from './registration';
import { SystemSlice } from './system';

export type WizardState = {
  cloudProviders: CloudProviderSlice;
  compliance: ComplianceSlice;
  content: ContentSlice;
  details: DetailsSlice;
  filesystem: FilesystemSlice;
  output: OutputSlice;
  registration: RegistrationSlice;
  system: SystemSlice;
};
