//this apiSlice.js will be parent for other apiSlices

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BASE_URL } from '../constants'
import { logout } from './authSlice';

// const baseQuery = fetchBaseQuery({
//     baseUrl: BASE_URL
// })
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
});

async function baseQueryWithAuth(args, api, extra) {
  const result = await baseQuery(args, api, extra);
  // Dispatch the logout action on 401.
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth, // Use the customized baseQuery
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});

// const baseQuery = fetchBaseQuery({
//     baseUrl: BASE_URL,
//     prepareHeaders: (headers, { getState }) => {
//       // You can include headers here if needed
//       return headers;
//     },
//     // Log the request URL
//     async fetchFn(url, options) {
//       console.log('Request URL:', url);
//       console.log('Request Options:', options);
//       return fetch(url, options);
//     },
//   });
// export const apiSlice = createApi({
//     baseQuery,
//     tagTypes: ['Product', 'Order', 'User'],
//     endpoints: (builder) => ({}),

// })