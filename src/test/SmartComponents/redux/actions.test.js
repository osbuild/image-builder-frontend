import { actions } from '../../../store/actions';
import types from '../../../store/types';

const compose = {
    '77e4c693-0497-4b85-936d-b2a3ad69571b': {
        status: 'uploading',
        distribution: 'fedora-31',
        architecture: 'x86_64',
        image_type: 'qcow2'
    }
};

describe('updateCompose', () => {
    test('returns dict', () => {
        const result = actions.updateCompose(compose);

        // this function updates the type attribute and
        // returns everything else unchanged
        expect(result.type).toBe(types.UPDATE_COMPOSE);
        expect(result.compose).toBe(compose);
    });
});
