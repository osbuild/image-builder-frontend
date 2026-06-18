import type { RootState } from '@/store';
import {
  initialState as wizardInitialState,
  type WizardState,
} from '@/store/slices/wizard';

// Minimal mock state that satisfies RootState for wizard tests
// We only need the slices that selectors might access
export const mockRootState: RootState = {
  env: {
    isOnPremise: false,
  },
  wizard: { ...wizardInitialState },
  wizardModal: {
    isModalOpen: false,
    mode: 'create',
  },
  blueprints: {
    selectedBlueprintId: undefined,
    searchInput: undefined,
    offset: 0,
    limit: 10,
    versionFilter: 'all',
  },
  cloudConfig: {
    aws: {},
  },
  // RTK Query API slices - minimal mocks
  contentSourcesApi: {} as RootState['contentSourcesApi'],
  imageBuilderApi: {} as RootState['imageBuilderApi'],
  rhsmApi: {} as RootState['rhsmApi'],
  complianceApi: {} as RootState['complianceApi'],
};

// Helper to create a modified RootState with wizard overrides
export const createMockState = (
  wizardOverrides: Partial<WizardState>,
): RootState => ({
  ...mockRootState,
  wizard: {
    ...mockRootState.wizard,
    ...wizardOverrides,
  },
});

// Helper to create a state with a user for user-related tests
export const createStateWithUser = (
  userOverrides: Partial<WizardState['system']['users'][0]> = {},
): RootState =>
  createMockState({
    system: {
      ...wizardInitialState.system,
      users: [
        {
          name: 'testuser',
          password: '',
          ssh_key: '',
          groups: [],
          isAdministrator: false,
          hasPassword: false,
          ...userOverrides,
        },
      ],
    },
  });

// Helper to create a state with partitions for filesystem tests
export const createStateWithPartitions = (
  partitions: WizardState['filesystem']['fileSystem']['partitions'],
): RootState =>
  createMockState({
    filesystem: {
      ...wizardInitialState.filesystem,
      fileSystem: {
        partitions,
      },
    },
  });

// Helper to create a state with packages for content tests
export const createStateWithPackages = (
  packages: WizardState['content']['packages'],
  modules: WizardState['content']['enabledModules'] = [],
): RootState =>
  createMockState({
    content: {
      ...wizardInitialState.content,
      packages,
      enabledModules: modules,
    },
  });
