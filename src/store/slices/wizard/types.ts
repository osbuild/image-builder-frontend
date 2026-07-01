import {
  BlueprintExportResponse,
  BlueprintResponse,
  ImageRequest,
} from '@/store/api/backend';

type BlueprintWithImageRequests = BlueprintExportResponse & {
  image_requests?: ImageRequest[] | undefined;
};

// This is a shared type for the request parsers
// so that we can re-use the same type for each
// of the parsers that need it
export type RequestLike = BlueprintResponse | BlueprintWithImageRequests;
