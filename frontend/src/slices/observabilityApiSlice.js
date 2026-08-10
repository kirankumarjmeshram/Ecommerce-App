import { apiSlice } from './apiSlice';

export const observabilityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getObservabilitySummary: builder.query({
      query: () => ({ url: 'api/admin/observability/summary' }),
      keepUnusedDataFor: 5,
    }),
  }),
});

export const { useGetObservabilitySummaryQuery } = observabilityApiSlice;
