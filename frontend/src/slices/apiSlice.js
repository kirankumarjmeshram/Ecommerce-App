//this apiSlice.js will be parent for other apiSlices

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BASE_URL } from '../constants'

// const baseQuery = fetchBaseQuery({
//     baseUrl: BASE_URL
// })
const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // You can include headers here if needed
      return headers;
    },
    // Log the request URL
    async fetchFn(url, options) {
      console.log('Request URL:', url);
      console.log('Request Options:', options);
      return fetch(url, options);
    },
  });
export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['Product', 'Order', 'User'],
    endpoints: (builder) => ({}),

})