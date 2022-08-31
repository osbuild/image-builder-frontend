import composesSlice from '../../store/composesSlice';
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
    const result = composesSlice(
      {},
      {
        type: 'THIS-IS-UNKNOWN',
      }
    );

    expect(result).toEqual({});
  });

  test('returns updated state for composes/composeAdded', () => {
    const state = {
      allIds: [],
      byId: {},
      count: 1,
      errors: null,
    };
    const result = composesSlice(state, {
      type: 'composes/composeAdded',
      payload: { compose },
    });

    expect(result.allIds).toEqual(['77e4c693-0497-4b85-936d-b2a3ad69571b']);
    expect(result.byId['77e4c693-0497-4b85-936d-b2a3ad69571b']).toEqual(
      compose
    );
    expect(result.count).toEqual(1);
    expect(result.error).toEqual(null);
  });

  test('returns updated state for composes/composesUpdatedCount', () => {
    const state = {
      allIds: [],
      byId: {},
      count: 0,
      error: null,
    };

    const result = composesSlice(state, {
      type: 'composes/composesUpdatedCount',
      payload: { count: 1 },
    });

    expect(result.count).toEqual(1);
  });
});
