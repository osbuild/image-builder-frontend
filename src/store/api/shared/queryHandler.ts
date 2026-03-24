import { BaseQueryApi } from '@reduxjs/toolkit/query';

import { toOnPremError } from './errors';
import { OnPremBaseQuery, OnPremBaseQueryArgs, OnPremError } from './types';

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
  ): Promise<{ data: ResultType } | { error: OnPremError }> => {
    try {
      const data = await fn({ queryArgs, api, extraOptions, baseQuery });
      return { data };
    } catch (error: unknown) {
      return { error: toOnPremError(error) };
    }
  };
};
