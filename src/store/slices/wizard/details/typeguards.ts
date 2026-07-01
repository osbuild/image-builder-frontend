import { BlueprintMetadata } from '@/store/api/backend';

// The API type defines metadata as required on BlueprintExportResponse,
// but at runtime it can be null/undefined (API/type mismatch).

export const isMetadata = (
  metadata?: BlueprintMetadata | undefined,
): metadata is BlueprintMetadata => {
  return !!metadata && typeof metadata === 'object';
};
