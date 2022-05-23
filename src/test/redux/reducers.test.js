import { composes } from '../../store/reducers/composes';
import types from '../../store/types';
import { RHEL_8 } from '../../constants.js';

const compose = {
  id: '77e4c693-0497-4b85-936d-b2a3ad69571b',
  distribution: RHEL_8,
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'ami',
      upload_request: {
        type: 'aws',
        options: {},
      },
    },
  ],
  image_status: {
    status: 'uploading',
  },
};

describe('composes', () => {
  test('returns state for unknown actions', () => {
    const result = composes(
      {},
      {
        type: 'THIS-IS-UNKNOWN',
      }
    );

    expect(result).toEqual({});
  });

  test('returns updated state for types.COMPOSE_ADDED', () => {
    const state = {
      allIds: [],
      byId: {},
      count: 1,
      errors: null,
    };
    const result = composes(state, {
      type: types.COMPOSE_ADDED,
      payload: { compose },
    });

    expect(result.allIds).toEqual(['77e4c693-0497-4b85-936d-b2a3ad69571b']);
    expect(result.byId['77e4c693-0497-4b85-936d-b2a3ad69571b']).toEqual(
      compose
    );
    expect(result.count).toEqual(1);
    expect(result.error).toEqual(null);
  });

  test('returns updated state for types.COMPOSE_UPDATED', () => {
    const state = {
      allIds: ['77e4c693-0497-4b85-936d-b2a3ad69571b'],
      byId: {
        '77e4c693-0497-4b85-936d-b2a3ad69571b': {},
      },
      count: 2,
      error: null,
    };
    const result = composes(state, {
      type: types.COMPOSE_UPDATED,
      payload: { compose },
    });

    expect(result.allIds).toEqual(['77e4c693-0497-4b85-936d-b2a3ad69571b']);
    expect(result.byId['77e4c693-0497-4b85-936d-b2a3ad69571b']).toEqual(
      compose
    );
    expect(result.count).toEqual(2);
    expect(result.error).toEqual(null);
  });

  test('returns updated state for types.COMPOSE_FAILED', () => {
    const state = {
      allIds: [],
      byId: {},
      count: 0,
      error: null,
    };
    const result = composes(state, {
      type: types.COMPOSE_FAILED,
      payload: { error: 'test error' },
    });

    expect(result.error).toEqual('test error');
  });

  test('returns updated state for types.COMPOSES_UPDATED_COUNT', () => {
    const state = {
      allIds: [],
      byId: {},
      count: 0,
      error: null,
    };

    const result = composes(state, {
      type: types.COMPOSES_UPDATED_COUNT,
      payload: { count: 1 },
    });

    expect(result.count).toEqual(1);
  });
});
