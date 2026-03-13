import { BaseQueryApi } from '@reduxjs/toolkit/query';

import { OnPremBaseQuery, OnPremBaseQueryArgs } from './types';

type QueryFnContext<QueryArg> = {
  queryArgs: QueryArg;
  api: BaseQueryApi;
  extraOptions: Record<string, unknown>;
  baseQuery: (args: OnPremBaseQueryArgs) => ReturnType<OnPremBaseQuery>;
};

export const onPremQueryHandler = <ResultType, QueryArg>(
  fn: (ctx: QueryFnContext<QueryArg>) => Promise<ResultType>,
) => {
  return async (
    queryArgs: QueryArg,
    api: QueryFnContext<QueryArg>['api'],
    extraOptions: QueryFnContext<QueryArg>['extraOptions'],
    baseQuery: (args: OnPremBaseQueryArgs) => ReturnType<OnPremBaseQuery>,
  ): Promise<{ data: ResultType } | { error: string }> => {
    try {
      const data = await fn({ queryArgs, api, extraOptions, baseQuery });
      return { data };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { error: error.message };
      }

      return { error: String(error) };
    }
  };
};
