import {
  BlueprintExportResponse,
  BlueprintResponse,
  ImageRequest,
} from '@/store/api/backend';

export type ValidationIssue = {
  message: string;
  value?: string;
  kind?: 'format' | 'duplicate';
};

export type SchemaValidationResult<T> = {
  data?: T | undefined;
  issues: ValidationIssue[];
};

export type ValidationResult<T = unknown> = {
  errors: ValidationIssue[];
  warnings?: ValidationIssue[];
  data?: T | undefined;
};

type BlueprintWithImageRequests = BlueprintExportResponse & {
  image_requests?: ImageRequest[] | undefined;
};

// This is a shared type for the request parsers
// so that we can re-use the same type for each
// of the parsers that need it
export type RequestLike = BlueprintResponse | BlueprintWithImageRequests;
