import types from '../types';

// Example of action.compose
// {
//     "77e4c693-0497-4b85-936d-b2a3ad69571b": {
//         created_at: "2021-04-21 11:20:46.927594 +0000 UTC",
//         id: "77e4c693-0497-4b85-936d-b2a3ad69571b",
//         request: {
//             distribution: "rhel-8",
//             image_requests: [
//                 {
//                     architecture: "x86_64",
//                     image_type: "ami",
//                     upload_request: {
//                         type: "aws",
//                         options: {}
//                     }
//                 }
//             ]
//         },
//         image_status: {
//             status: "uploading",
//         },
//     }
// };

const initialComposesState = {
    allIds: [],
    byId: {},
    error: null,
};

export function composes(state = initialComposesState, action) {
    switch (action.type) {
        case types.COMPOSE_ADDED:
            return {
                ...state,
                allIds: [
                    ...state.allIds,
                    action.payload.compose.id
                ],
                byId: {
                    ...state.byId,
                    [action.payload.compose.id]: action.payload.compose,
                },
                error: null,
            };
        case types.COMPOSE_FAILED:
            return {
                ...state,
                error: action.payload.error,
            };
        case types.COMPOSE_PENDING:
            return {
                ...state,
                error: null,
            };
        case types.COMPOSE_UPDATED:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.payload.compose.id]: action.payload.compose,
                }
            };
        case types.COMPOSE_UPDATED_STATUS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.payload.id]: {
                        ...state.byId[action.payload.id],
                        image_status: action.payload.status,
                    }
                }
            };
        default:
            return state;
    }
}

export default composes;
