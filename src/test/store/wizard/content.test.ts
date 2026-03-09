import { describe, expect, it } from 'vitest';

import type {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  PackageRepository,
} from '@/Components/CreateImageWizard/steps/Packages/packagesTypes';
import type { Module } from '@/store/api/backend';
import wizardReducer, {
  addModule,
  addPackage,
  addPackageGroup,
  initialState,
  removeModule,
  removePackage,
  removePackageGroup,
  type wizardState,
} from '@/store/wizardSlice';

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

        expect(result.packages).toHaveLength(1);
        expect(result.packages[0].name).toBe('vim');
      });

      it('should add multiple packages', () => {
        let state = wizardReducer(
          initialState,
          addPackage(createPackage('vim')),
        );
        state = wizardReducer(state, addPackage(createPackage('git')));
        state = wizardReducer(state, addPackage(createPackage('curl')));

        expect(state.packages).toHaveLength(3);
        expect(state.packages.map((p) => p.name)).toEqual([
          'vim',
          'git',
          'curl',
        ]);
      });

      it('should update existing package if same name', () => {
        const stateWithPackage: wizardState = {
          ...initialState,
          packages: [createPackage('vim', { summary: 'old summary' })],
        };

        const updatedPackage = createPackage('vim', { summary: 'new summary' });
        const result = wizardReducer(
          stateWithPackage,
          addPackage(updatedPackage),
        );

        expect(result.packages).toHaveLength(1);
        expect(result.packages[0].summary).toBe('new summary');
      });
    });

    describe('removePackage', () => {
      it('should remove package by name', () => {
        const stateWithPackages: wizardState = {
          ...initialState,
          packages: [
            createPackage('vim'),
            createPackage('git'),
            createPackage('curl'),
          ],
        };

        const result = wizardReducer(stateWithPackages, removePackage('git'));

        expect(result.packages).toHaveLength(2);
        expect(result.packages.map((p) => p.name)).toEqual(['vim', 'curl']);
      });

      it('should do nothing when package not found', () => {
        const stateWithPackages: wizardState = {
          ...initialState,
          packages: [createPackage('vim')],
        };

        const result = wizardReducer(
          stateWithPackages,
          removePackage('nonexistent'),
        );

        expect(result.packages).toHaveLength(1);
      });
    });
  });

  describe('module management', () => {
    describe('addModule', () => {
      it('should add a module to empty list', () => {
        const module = createModule('nodejs', '18');

        const result = wizardReducer(initialState, addModule(module));

        expect(result.enabled_modules).toHaveLength(1);
        expect(result.enabled_modules[0].name).toBe('nodejs');
        expect(result.enabled_modules[0].stream).toBe('18');
      });

      it('should update existing module if same name', () => {
        const stateWithModule: wizardState = {
          ...initialState,
          enabled_modules: [createModule('nodejs', '16')],
        };

        const updatedModule = createModule('nodejs', '18');
        const result = wizardReducer(stateWithModule, addModule(updatedModule));

        expect(result.enabled_modules).toHaveLength(1);
        expect(result.enabled_modules[0].stream).toBe('18');
      });

      it('should add different modules', () => {
        let state = wizardReducer(
          initialState,
          addModule(createModule('nodejs', '18')),
        );
        state = wizardReducer(state, addModule(createModule('ruby', '3.1')));

        expect(state.enabled_modules).toHaveLength(2);
      });
    });

    describe('removeModule', () => {
      it('should remove module when no packages are linked', () => {
        const stateWithModule: wizardState = {
          ...initialState,
          enabled_modules: [createModule('nodejs', '18')],
          packages: [],
        };

        const result = wizardReducer(stateWithModule, removeModule('nodejs'));

        expect(result.enabled_modules).toHaveLength(0);
      });

      it('should NOT remove module when packages are linked to it', () => {
        const stateWithModuleAndPackage: wizardState = {
          ...initialState,
          enabled_modules: [createModule('nodejs', '18')],
          packages: [createPackage('npm', { module_name: 'nodejs' })],
        };

        const result = wizardReducer(
          stateWithModuleAndPackage,
          removeModule('nodejs'),
        );

        // Module should still exist because a package depends on it
        expect(result.enabled_modules).toHaveLength(1);
        expect(result.enabled_modules[0].name).toBe('nodejs');
      });

      it('should remove module when last linked package is removed first', () => {
        let state: wizardState = {
          ...initialState,
          enabled_modules: [createModule('nodejs', '18')],
          packages: [createPackage('npm', { module_name: 'nodejs' })],
        };

        // Remove the package first
        state = wizardReducer(state, removePackage('npm'));

        // Now removing the module should work
        state = wizardReducer(state, removeModule('nodejs'));

        expect(state.enabled_modules).toHaveLength(0);
      });

      it('should do nothing when module not found', () => {
        const stateWithModule: wizardState = {
          ...initialState,
          enabled_modules: [createModule('nodejs', '18')],
        };

        const result = wizardReducer(
          stateWithModule,
          removeModule('nonexistent'),
        );

        expect(result.enabled_modules).toHaveLength(1);
      });
    });
  });

  describe('package group management', () => {
    describe('addPackageGroup', () => {
      it('should add a package group', () => {
        const group = createGroup('Development Tools');

        const result = wizardReducer(initialState, addPackageGroup(group));

        expect(result.groups).toHaveLength(1);
        expect(result.groups[0].name).toBe('Development Tools');
      });

      it('should update existing group if same name', () => {
        const stateWithGroup: wizardState = {
          ...initialState,
          groups: [
            createGroup('Development Tools', { description: 'old desc' }),
          ],
        };

        const updatedGroup = createGroup('Development Tools', {
          description: 'new desc',
        });
        const result = wizardReducer(
          stateWithGroup,
          addPackageGroup(updatedGroup),
        );

        expect(result.groups).toHaveLength(1);
        expect(result.groups[0].description).toBe('new desc');
      });
    });

    describe('removePackageGroup', () => {
      it('should remove package group by name', () => {
        const stateWithGroups: wizardState = {
          ...initialState,
          groups: [createGroup('Development Tools'), createGroup('Server')],
        };

        const result = wizardReducer(
          stateWithGroups,
          removePackageGroup('Development Tools'),
        );

        expect(result.groups).toHaveLength(1);
        expect(result.groups[0].name).toBe('Server');
      });

      it('should do nothing when group not found', () => {
        const stateWithGroup: wizardState = {
          ...initialState,
          groups: [createGroup('Development Tools')],
        };

        const result = wizardReducer(
          stateWithGroup,
          removePackageGroup('nonexistent'),
        );

        expect(result.groups).toHaveLength(1);
      });
    });
  });
});
