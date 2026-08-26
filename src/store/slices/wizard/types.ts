import {
  BlueprintExportResponse,
  BlueprintResponse,
  ImageRequest,
} from '@/store/api/backend';

// Field-level validation errors for wizard subslices.
// Empty record = valid; non-empty = one or more fields have errors.
// Consumers derive disabledNext from this rather than tracking it separately.
export type ValidationErrors = Record<string, string>;

type BlueprintWithImageRequests = BlueprintExportResponse & {
  image_requests?: ImageRequest[] | undefined;
};

// This is a shared type for the request parsers
// so that we can re-use the same type for each
// of the parsers that need it
export type RequestLike = BlueprintResponse | BlueprintWithImageRequests;
