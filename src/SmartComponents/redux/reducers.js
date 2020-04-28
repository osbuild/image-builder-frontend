import types from './types';

// Example of action.compose
// {
//     "xxxx-xxxx-xxxx-xxxx": {
//         state: "uploading",
//         distribution: "fedora-31",
//         architecture: "x86_64",
//         image_type: "qcow2"
//     }
// };

export function composeReducer(state = { }, action) {
    switch (action.type) {
        case types.UPDATE_COMPOSE:
            return Object.assign({}, state, action.compose);
        default:
            return {
                ...state
            };
    }
}
