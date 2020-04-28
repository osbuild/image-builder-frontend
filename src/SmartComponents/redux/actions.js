import types from './types';

function updateCompose(compose) {
    return {
        type: types.UPDATE_COMPOSE,
        compose
    };
}

export default {
    updateCompose,
};
