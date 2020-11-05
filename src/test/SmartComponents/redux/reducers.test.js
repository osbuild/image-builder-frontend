import { composeReducer } from '../../../SmartComponents/redux/reducers';
import types from '../../../SmartComponents/redux/types';

const compose = {
    'xxxx-xxxx-xxxx-xxxx': {
        state: 'uploading',
        distribution: 'fedora-31',
        architecture: 'x86_64',
        image_type: 'qcow2'
    }
};

describe('composeReducer', () => {
    test('returns state for unknown actions', () => {
        const result = composeReducer({}, {
            type: 'THIS-IS-UNKNOWN',
        });

        expect(result).toEqual({});
    });

    test('returns updates state for types.UPDATE_COMPOSE', () => {
        const state = {
            testAttr: 'test-me'
        };
        const result = composeReducer(state, {
            type: types.UPDATE_COMPOSE,
            compose
        });

        expect(result.testAttr).toBe('test-me');
        expect(result['xxxx-xxxx-xxxx-xxxx']).toEqual(compose['xxxx-xxxx-xxxx-xxxx']);
    });
});
