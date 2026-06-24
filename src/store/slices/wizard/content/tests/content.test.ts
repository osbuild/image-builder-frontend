import { describe, expect, it } from 'vitest';

import type { Module } from '@/store/api/backend';
import {
  addModule,
  addPackage,
  addPackageGroup,
  type GroupWithRepositoryInfo,
  type IBPackageWithRepositoryInfo,
  initialState,
  type PackageRepository,
  removeModule,
  removePackage,
  removePackageGroup,
  wizardReducer,
  type WizardState,
} from '@/store/slices/wizard';

const createPackage = (
  name: string,
  overrides: Partial<IBPackageWithRepositoryInfo> = {},
): IBPackageWithRepositoryInfo => ({
  name,
  summary: `${name} package`,
  repository: 'distro' as PackageRepository,
  ...overrides,
});

const createGroup = (
  name: string,
  overrides: Partial<GroupWithRepositoryInfo> = {},
): GroupWithRepositoryInfo => ({
  name,
  description: `${name} group`,
  repository: 'distro' as PackageRepository,
  ...overrides,
});

const createModule = (name: string, stream: string = 'default'): Module => ({
  name,
  stream,
});

describe('content reducers', () => {
  describe('package management', () => {
    describe('addPackage', () => {
      it('should add a package to empty list', () => {
        const pkg = createPackage('vim');

        const result = wizardReducer(initialState, addPackage(pkg));

        expect(result.content.packages).toHaveLength(1);
        expect(result.content.packages[0].name).toBe('vim');
      });

      it('should add multiple packages', () => {
        let state = wizardReducer(
          initialState,
          addPackage(createPackage('vim')),
        );
        state = wizardReducer(state, addPackage(createPackage('git')));
        state = wizardReducer(state, addPackage(createPackage('curl')));

        expect(state.content.packages).toHaveLength(3);
        expect(state.content.packages.map((p) => p.name)).toEqual([
          'vim',
          'git',
          'curl',
        ]);
      });

      it('should update existing package if same name', () => {
        const stateWithPackage: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            packages: [createPackage('vim', { summary: 'old summary' })],
          },
        };

        const updatedPackage = createPackage('vim', { summary: 'new summary' });
        const result = wizardReducer(
          stateWithPackage,
          addPackage(updatedPackage),
        );

        expect(result.content.packages).toHaveLength(1);
        expect(result.content.packages[0].summary).toBe('new summary');
      });
    });

    describe('removePackage', () => {
      it('should remove package by name', () => {
        const stateWithPackages: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            packages: [
              createPackage('vim'),
              createPackage('git'),
              createPackage('curl'),
            ],
          },
        };

        const result = wizardReducer(stateWithPackages, removePackage('git'));

        expect(result.content.packages).toHaveLength(2);
        expect(result.content.packages.map((p) => p.name)).toEqual([
          'vim',
          'curl',
        ]);
      });

      it('should do nothing when package not found', () => {
        const stateWithPackages: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            packages: [createPackage('vim')],
          },
        };

        const result = wizardReducer(
          stateWithPackages,
          removePackage('nonexistent'),
        );

        expect(result.content.packages).toHaveLength(1);
      });
    });
  });

  describe('module management', () => {
    describe('addModule', () => {
      it('should add a module to empty list', () => {
        const module = createModule('nodejs', '18');

        const result = wizardReducer(initialState, addModule(module));

        expect(result.content.enabledModules).toHaveLength(1);
        expect(result.content.enabledModules[0].name).toBe('nodejs');
        expect(result.content.enabledModules[0].stream).toBe('18');
      });

      it('should update existing module if same name', () => {
        const stateWithModule: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            enabledModules: [createModule('nodejs', '16')],
          },
        };

        const updatedModule = createModule('nodejs', '18');
        const result = wizardReducer(stateWithModule, addModule(updatedModule));

        expect(result.content.enabledModules).toHaveLength(1);
        expect(result.content.enabledModules[0].stream).toBe('18');
      });

      it('should add different modules', () => {
        let state = wizardReducer(
          initialState,
          addModule(createModule('nodejs', '18')),
        );
        state = wizardReducer(state, addModule(createModule('ruby', '3.1')));

        expect(state.content.enabledModules).toHaveLength(2);
      });
    });

    describe('removeModule', () => {
      it('should remove module when no packages are linked', () => {
        const stateWithModule: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            enabledModules: [createModule('nodejs', '18')],
            packages: [],
          },
        };

        const result = wizardReducer(stateWithModule, removeModule('nodejs'));

        expect(result.content.enabledModules).toHaveLength(0);
      });

      it('should NOT remove module when packages are linked to it', () => {
        const stateWithModuleAndPackage: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            enabledModules: [createModule('nodejs', '18')],
            packages: [createPackage('npm', { module_name: 'nodejs' })],
          },
        };

        const result = wizardReducer(
          stateWithModuleAndPackage,
          removeModule('nodejs'),
        );

        // Module should still exist because a package depends on it
        expect(result.content.enabledModules).toHaveLength(1);
        expect(result.content.enabledModules[0].name).toBe('nodejs');
      });

      it('should remove module when last linked package is removed first', () => {
        let state: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            enabledModules: [createModule('nodejs', '18')],
            packages: [createPackage('npm', { module_name: 'nodejs' })],
          },
        };

        // Remove the package first
        state = wizardReducer(state, removePackage('npm'));

        // Now removing the module should work
        state = wizardReducer(state, removeModule('nodejs'));

        expect(state.content.enabledModules).toHaveLength(0);
      });

      it('should do nothing when module not found', () => {
        const stateWithModule: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            enabledModules: [createModule('nodejs', '18')],
          },
        };

        const result = wizardReducer(
          stateWithModule,
          removeModule('nonexistent'),
        );

        expect(result.content.enabledModules).toHaveLength(1);
      });
    });
  });

  describe('package group management', () => {
    describe('addPackageGroup', () => {
      it('should add a package group', () => {
        const group = createGroup('Development Tools');

        const result = wizardReducer(initialState, addPackageGroup(group));

        expect(result.content.groups).toHaveLength(1);
        expect(result.content.groups[0].name).toBe('Development Tools');
      });

      it('should update existing group if same name', () => {
        const stateWithGroup: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            groups: [
              createGroup('Development Tools', { description: 'old desc' }),
            ],
          },
        };

        const updatedGroup = createGroup('Development Tools', {
          description: 'new desc',
        });
        const result = wizardReducer(
          stateWithGroup,
          addPackageGroup(updatedGroup),
        );

        expect(result.content.groups).toHaveLength(1);
        expect(result.content.groups[0].description).toBe('new desc');
      });
    });

    describe('removePackageGroup', () => {
      it('should remove package group by name', () => {
        const stateWithGroups: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            groups: [createGroup('Development Tools'), createGroup('Server')],
          },
        };

        const result = wizardReducer(
          stateWithGroups,
          removePackageGroup('Development Tools'),
        );

        expect(result.content.groups).toHaveLength(1);
        expect(result.content.groups[0].name).toBe('Server');
      });

      it('should do nothing when group not found', () => {
        const stateWithGroup: WizardState = {
          ...initialState,
          content: {
            ...initialState.content,
            groups: [createGroup('Development Tools')],
          },
        };

        const result = wizardReducer(
          stateWithGroup,
          removePackageGroup('nonexistent'),
        );

        expect(result.content.groups).toHaveLength(1);
      });
    });
  });
});
