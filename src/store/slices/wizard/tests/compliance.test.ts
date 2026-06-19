import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';

import {
  changeComplianceType,
  changeFips,
  combinedInitialState,
  selectCompliancePolicyID,
  selectCompliancePolicyTitle,
  selectComplianceProfileID,
  selectComplianceType,
  selectFips,
  setCompliancePolicy,
  setOscapProfile,
  wizardReducer,
} from '@/store/slices/wizard';

import { createMockState } from './mockWizardState';

const createStore = (overrides: Partial<typeof combinedInitialState> = {}) =>
  configureStore({
    reducer: { wizard: wizardReducer },
    preloadedState: {
      wizard: { ...combinedInitialState, ...overrides },
    },
  });

describe('compliance submodule', () => {
  describe('initial state', () => {
    it('has compliance nested with type, policyID, profileID, policyTitle, and fips', () => {
      const state = combinedInitialState;

      expect(state.compliance).toEqual({
        type: 'none',
        policyID: undefined,
        profileID: undefined,
        policyTitle: undefined,
        fips: {
          enabled: false,
        },
      });
    });

    it('does not have a top-level fips key', () => {
      expect(combinedInitialState).not.toHaveProperty('fips');
    });

    it('does not have complianceType inside compliance (uses type instead)', () => {
      expect(combinedInitialState.compliance).not.toHaveProperty(
        'complianceType',
      );
      expect(combinedInitialState.compliance).toHaveProperty('type');
    });
  });

  describe('selectors', () => {
    it('selectComplianceType reads from compliance.type', () => {
      const state = createMockState({
        compliance: {
          ...combinedInitialState.compliance,
          type: 'openscap',
        },
      });

      expect(selectComplianceType(state)).toBe('openscap');
    });

    it('selectCompliancePolicyID reads from compliance.policyID', () => {
      const state = createMockState({
        compliance: {
          ...combinedInitialState.compliance,
          policyID: 'policy-123',
        },
      });

      expect(selectCompliancePolicyID(state)).toBe('policy-123');
    });

    it('selectComplianceProfileID reads from compliance.profileID', () => {
      const state = createMockState({
        compliance: {
          ...combinedInitialState.compliance,
          profileID: 'profile-456',
        },
      });

      expect(selectComplianceProfileID(state)).toBe('profile-456');
    });

    it('selectCompliancePolicyTitle reads from compliance.policyTitle', () => {
      const state = createMockState({
        compliance: {
          ...combinedInitialState.compliance,
          policyTitle: 'My Policy',
        },
      });

      expect(selectCompliancePolicyTitle(state)).toBe('My Policy');
    });

    it('selectFips reads from compliance.fips', () => {
      const state = createMockState({
        compliance: {
          ...combinedInitialState.compliance,
          fips: { enabled: true },
        },
      });

      expect(selectFips(state)).toEqual({ enabled: true });
    });
  });

  describe('reducers', () => {
    it('changeComplianceType updates compliance.type', () => {
      const store = createStore();

      store.dispatch(changeComplianceType('openscap'));

      expect(store.getState().wizard.compliance.type).toBe('openscap');
    });

    it('setCompliancePolicy updates compliance.policyID and policyTitle', () => {
      const store = createStore();

      store.dispatch(
        setCompliancePolicy({
          policyID: 'policy-123',
          policyTitle: 'My Policy',
        }),
      );

      expect(store.getState().wizard.compliance.policyID).toBe('policy-123');
      expect(store.getState().wizard.compliance.policyTitle).toBe('My Policy');
    });

    it('setOscapProfile updates compliance.profileID', () => {
      const store = createStore();

      store.dispatch(setOscapProfile('profile-456'));

      expect(store.getState().wizard.compliance.profileID).toBe('profile-456');
    });

    it('changeFips updates compliance.fips.enabled', () => {
      const store = createStore();

      store.dispatch(changeFips(true));

      expect(store.getState().wizard.compliance.fips.enabled).toBe(true);
    });
  });
});
