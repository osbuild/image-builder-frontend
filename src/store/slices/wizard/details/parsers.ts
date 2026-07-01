import {
  BlueprintExportResponse as Blueprint,
  BlueprintResponse as Request,
} from '@/store/api/backend';

import { initialState } from './state';
import { isMetadata } from './typeguards';
import { DetailsSlice } from './types';

import { RequestLike } from '../types';

const parseBlueprint = (request: RequestLike): DetailsSlice['blueprint'] => {
  return {
    name: request.name || '',
    isCustomName: true,
    description: request.description || initialState.blueprint.description,
    mode: request.bootc ? 'image' : 'package',
  };
};

const parseMetadata = ({ metadata }: Blueprint): DetailsSlice['metadata'] => {
  const defaults = {
    parent_id: null,
    exported_at: '',
    is_on_prem: false,
  };
  if (!isMetadata(metadata)) {
    return defaults;
  }

  return {
    parent_id: metadata.parent_id || defaults.parent_id,
    exported_at: metadata.exported_at || defaults.exported_at,
    is_on_prem: metadata.is_on_prem || defaults.is_on_prem,
  };
};

const parseRequestDetails = (request: Request): DetailsSlice => ({
  blueprintId: request.id,
  mode: 'edit',
  blueprint: parseBlueprint(request),
});

const parseBlueprintDetails = (blueprint: Blueprint): DetailsSlice => ({
  mode: 'create',
  blueprint: parseBlueprint(blueprint),
  metadata: parseMetadata(blueprint),
});

// NOTE: this is a slightly special case, we have a factory
// function that only takes care of the differences between
// a blueprint object and a request object. This way we only
// need to expose one public function and the consumer doesn't
// need to know what the difference is
export const parseDetailsFromRequest = (request: RequestLike): DetailsSlice => {
  if ('id' in request) {
    return parseRequestDetails(request);
  }

  return parseBlueprintDetails(request);
};
