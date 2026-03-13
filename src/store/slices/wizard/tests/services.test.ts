import { describe, expect, it } from 'vitest';

import wizardReducer, {
  addDisabledService,
  addEnabledService,
  addMaskedService,
  changeDisabledServices,
  changeEnabledServices,
  changeMaskedServices,
  initialState,
  removeDisabledService,
  removeEnabledService,
  removeMaskedService,
  type wizardState,
} from '@/store/slices/wizard';

describe('services reducers', () => {
  describe('enabled services', () => {
    describe('addEnabledService', () => {
      it('should add a service to enabled list', () => {
        const result = wizardReducer(initialState, addEnabledService('httpd'));

        expect(result.services.enabled).toContain('httpd');
      });

      it('should not add duplicate services', () => {
        const stateWithService: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            enabled: ['httpd'],
          },
        };

        const result = wizardReducer(
          stateWithService,
          addEnabledService('httpd'),
        );

        expect(result.services.enabled).toEqual(['httpd']);
      });

      it('should add multiple different services', () => {
        let state = wizardReducer(initialState, addEnabledService('httpd'));
        state = wizardReducer(state, addEnabledService('sshd'));
        state = wizardReducer(state, addEnabledService('nginx'));

        expect(state.services.enabled).toEqual(['httpd', 'sshd', 'nginx']);
      });
    });

    describe('removeEnabledService', () => {
      it('should remove a service from enabled list', () => {
        const stateWithServices: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            enabled: ['httpd', 'sshd', 'nginx'],
          },
        };

        const result = wizardReducer(
          stateWithServices,
          removeEnabledService('sshd'),
        );

        expect(result.services.enabled).toEqual(['httpd', 'nginx']);
      });

      it('should do nothing when service not found', () => {
        const stateWithServices: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            enabled: ['httpd'],
          },
        };

        const result = wizardReducer(
          stateWithServices,
          removeEnabledService('nonexistent'),
        );

        expect(result.services.enabled).toEqual(['httpd']);
      });
    });

    describe('changeEnabledServices', () => {
      it('should replace all enabled services', () => {
        const stateWithServices: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            enabled: ['httpd', 'sshd'],
          },
        };

        const result = wizardReducer(
          stateWithServices,
          changeEnabledServices(['nginx', 'postgresql']),
        );

        expect(result.services.enabled).toEqual(['nginx', 'postgresql']);
      });

      it('should set empty array', () => {
        const stateWithServices: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            enabled: ['httpd', 'sshd'],
          },
        };

        const result = wizardReducer(
          stateWithServices,
          changeEnabledServices([]),
        );

        expect(result.services.enabled).toEqual([]);
      });
    });
  });

  describe('masked services', () => {
    describe('addMaskedService', () => {
      it('should add a service to masked list', () => {
        const result = wizardReducer(
          initialState,
          addMaskedService('firewalld'),
        );

        expect(result.services.masked).toContain('firewalld');
      });

      it('should not add duplicate services', () => {
        const stateWithService: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            masked: ['firewalld'],
          },
        };

        const result = wizardReducer(
          stateWithService,
          addMaskedService('firewalld'),
        );

        expect(result.services.masked).toEqual(['firewalld']);
      });
    });

    describe('removeMaskedService', () => {
      it('should remove a service from masked list', () => {
        const stateWithServices: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            masked: ['firewalld', 'iptables'],
          },
        };

        const result = wizardReducer(
          stateWithServices,
          removeMaskedService('firewalld'),
        );

        expect(result.services.masked).toEqual(['iptables']);
      });
    });

    describe('changeMaskedServices', () => {
      it('should replace all masked services', () => {
        const stateWithServices: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            masked: ['firewalld'],
          },
        };

        const result = wizardReducer(
          stateWithServices,
          changeMaskedServices(['iptables', 'nftables']),
        );

        expect(result.services.masked).toEqual(['iptables', 'nftables']);
      });
    });
  });

  describe('disabled services', () => {
    describe('addDisabledService', () => {
      it('should add a service to disabled list', () => {
        const result = wizardReducer(initialState, addDisabledService('cups'));

        expect(result.services.disabled).toContain('cups');
      });

      it('should not add duplicate services', () => {
        const stateWithService: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            disabled: ['cups'],
          },
        };

        const result = wizardReducer(
          stateWithService,
          addDisabledService('cups'),
        );

        expect(result.services.disabled).toEqual(['cups']);
      });
    });

    describe('removeDisabledService', () => {
      it('should remove a service from disabled list', () => {
        const stateWithServices: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            disabled: ['cups', 'bluetooth'],
          },
        };

        const result = wizardReducer(
          stateWithServices,
          removeDisabledService('cups'),
        );

        expect(result.services.disabled).toEqual(['bluetooth']);
      });
    });

    describe('changeDisabledServices', () => {
      it('should replace all disabled services', () => {
        const stateWithServices: wizardState = {
          ...initialState,
          services: {
            ...initialState.services,
            disabled: ['cups'],
          },
        };

        const result = wizardReducer(
          stateWithServices,
          changeDisabledServices(['bluetooth', 'avahi-daemon']),
        );

        expect(result.services.disabled).toEqual(['bluetooth', 'avahi-daemon']);
      });
    });
  });

  describe('service categories are independent', () => {
    it('should maintain separate lists for enabled, masked, and disabled', () => {
      let state = wizardReducer(initialState, addEnabledService('httpd'));
      state = wizardReducer(state, addMaskedService('firewalld'));
      state = wizardReducer(state, addDisabledService('cups'));

      expect(state.services.enabled).toEqual(['httpd']);
      expect(state.services.masked).toEqual(['firewalld']);
      expect(state.services.disabled).toEqual(['cups']);
    });

    it('should allow same service name in different categories', () => {
      // While this is unusual in practice, the reducer allows it
      let state = wizardReducer(initialState, addEnabledService('test'));
      state = wizardReducer(state, addMaskedService('test'));
      state = wizardReducer(state, addDisabledService('test'));

      expect(state.services.enabled).toContain('test');
      expect(state.services.masked).toContain('test');
      expect(state.services.disabled).toContain('test');
    });
  });
});
