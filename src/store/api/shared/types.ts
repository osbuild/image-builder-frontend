import { BaseQueryFn } from '@reduxjs/toolkit/query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Params = Record<string, any>;
export type Method = 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH'; // We can add more if we need
export type Headers = { [name: string]: string };

// The request options type
export type OnPremBaseQueryArgs = {
  url: string;
  method?: Method;
  body?: unknown;
  params?: Params;
  headers?: Headers;
};
// The base query function type (matches what baseQuery() returns)
export type OnPremBaseQuery = BaseQueryFn<OnPremBaseQueryArgs>;
