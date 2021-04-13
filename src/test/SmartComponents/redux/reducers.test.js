import { composeReducer } from '../../../store/reducers/composes';
import types from '../../../store/types';

const compose = {
    '77e4c693-0497-4b85-936d-b2a3ad69571b': {
        status: 'uploading',
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
        expect(result['77e4c693-0497-4b85-936d-b2a3ad69571b'])
            .toEqual(compose['77e4c693-0497-4b85-936d-b2a3ad69571b']);
    });
});
