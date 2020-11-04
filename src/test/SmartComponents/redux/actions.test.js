import actions from '../../../SmartComponents/redux/actions';
import types from '../../../SmartComponents/redux/types';

const compose = {
    'xxxx-xxxx-xxxx-xxxx': {
        state: 'uploading',
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
        expect(result.compose['xxxx-xxxx-xxxx-xxxx'].state).toBe('uploading');
        expect(result.compose['xxxx-xxxx-xxxx-xxxx'].distribution).toBe('fedora-31');
        expect(result.compose['xxxx-xxxx-xxxx-xxxx'].image_type).toBe('qcow2');
        expect(result.compose['xxxx-xxxx-xxxx-xxxx'].architecture).toBe('x86_64');
    });
});
