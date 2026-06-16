import { describe, expect, it } from 'vitest';

import {
  changeBlueprintDescription,
  changeBlueprintMode,
  changeBlueprintName,
  initialState,
  loadWizardState,
  selectBlueprintDescription,
  selectBlueprintId,
  selectBlueprintMode,
  selectBlueprintName,
  selectIsCustomName,
  selectMetadata,
  selectWizardMode,
  setIsCustomName,
  wizardReducer,
  type wizardState,
} from '@/store/slices/wizard';

import { createMockState } from './mockWizardState';

describe('details submodule', () => {
  describe('reducers', () => {
    it('changeBlueprintName should update details.blueprint.name', () => {
      const result = wizardReducer(
        initialState,
        changeBlueprintName('my-blueprint'),
      );

      expect(result.details.blueprint.name).toBe('my-blueprint');
    });

    it('setIsCustomName should set details.blueprint.isCustomName to true', () => {
      const result = wizardReducer(initialState, setIsCustomName());

      expect(result.details.blueprint.isCustomName).toBe(true);
    });

    it('changeBlueprintDescription should update details.blueprint.description', () => {
      const result = wizardReducer(
        initialState,
        changeBlueprintDescription('A test description'),
      );

      expect(result.details.blueprint.description).toBe('A test description');
    });

    it('changeBlueprintMode should update details.blueprint.mode', () => {
      const result = wizardReducer(initialState, changeBlueprintMode('image'));

      expect(result.details.blueprint.mode).toBe('image');
    });

    it('loadWizardState should load full state including details', () => {
      const stateToLoad: wizardState = {
        ...initialState,
        details: {
          ...initialState.details,
          blueprintId: 'test-id-123',
          mode: 'edit',
          blueprint: {
            name: 'loaded-blueprint',
            isCustomName: true,
            description: 'loaded description',
            mode: 'image',
          },
          metadata: {
            parent_id: 'parent-123',
            exported_at: '2024-01-01',
            is_on_prem: true,
          },
        },
      };

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.details.blueprintId).toBe('test-id-123');
      expect(result.details.mode).toBe('edit');
      expect(result.details.blueprint.name).toBe('loaded-blueprint');
      expect(result.details.blueprint.isCustomName).toBe(true);
      expect(result.details.blueprint.description).toBe('loaded description');
      expect(result.details.blueprint.mode).toBe('image');
      expect(result.details.metadata).toEqual({
        parent_id: 'parent-123',
        exported_at: '2024-01-01',
        is_on_prem: true,
      });
    });
  });

  describe('selectors', () => {
    it('selectBlueprintId should read from details.blueprintId', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          blueprintId: 'bp-456',
        },
      });

      expect(selectBlueprintId(state)).toBe('bp-456');
    });

    it('selectWizardMode should read from details.mode', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          mode: 'edit',
        },
      });

      expect(selectWizardMode(state)).toBe('edit');
    });

    it('selectBlueprintMode should read from details.blueprint.mode', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          blueprint: {
            ...initialState.details.blueprint,
            mode: 'image',
          },
        },
      });

      expect(selectBlueprintMode(state)).toBe('image');
    });

    it('selectBlueprintName should read from details.blueprint.name', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          blueprint: {
            ...initialState.details.blueprint,
            name: 'my-bp',
          },
        },
      });

      expect(selectBlueprintName(state)).toBe('my-bp');
    });

    it('selectIsCustomName should read from details.blueprint.isCustomName', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          blueprint: {
            ...initialState.details.blueprint,
            isCustomName: true,
          },
        },
      });

      expect(selectIsCustomName(state)).toBe(true);
    });

    it('selectBlueprintDescription should read from details.blueprint.description', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          blueprint: {
            ...initialState.details.blueprint,
            description: 'Test description',
          },
        },
      });

      expect(selectBlueprintDescription(state)).toBe('Test description');
    });

    it('selectMetadata should read from details.metadata', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          metadata: {
            parent_id: 'parent-1',
            exported_at: '2024-06-01',
            is_on_prem: false,
          },
        },
      });

      expect(selectMetadata(state)).toEqual({
        parent_id: 'parent-1',
        exported_at: '2024-06-01',
        is_on_prem: false,
      });
    });

    it('selectMetadata should return undefined when no metadata', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
        },
      });

      expect(selectMetadata(state)).toBeUndefined();
    });
  });

  describe('initial state shape', () => {
    it('should have details at top level with correct structure', () => {
      expect(initialState.details).toBeDefined();
      expect(initialState.details.mode).toBe('create');
      expect(initialState.details.blueprint).toBeDefined();
      expect(initialState.details.blueprint.mode).toBe('package');
      expect(initialState.details.blueprint.isCustomName).toBe(false);
      expect(initialState.details.blueprint.description).toBe('');
      expect(initialState.details.blueprintId).toBeUndefined();
      expect(initialState.details.metadata).toBeUndefined();
    });

    it('should NOT have wizardMode, blueprintMode, blueprintId, or metadata at top level', () => {
      const state = initialState as Record<string, unknown>;
      expect(state).not.toHaveProperty('wizardMode');
      expect(state).not.toHaveProperty('blueprintMode');
      expect(state).not.toHaveProperty('blueprintId');
      expect(state).not.toHaveProperty('metadata');
    });

    it('should NOT have blueprintName, blueprintDescription, isCustomName directly in details', () => {
      const details = initialState.details as Record<string, unknown>;
      expect(details).not.toHaveProperty('blueprintName');
      expect(details).not.toHaveProperty('blueprintDescription');
      expect(details).not.toHaveProperty('isCustomName');
    });
  });
});
