import type { ComposesResponseItem } from '@/store/api/backend/hosted';

export const byCreatedAtDesc = (
  a: ComposesResponseItem,
  b: ComposesResponseItem,
) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
