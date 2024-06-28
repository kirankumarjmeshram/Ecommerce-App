import { PRODUCT_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: () => ({
                url: `/${PRODUCT_URL}`
            }),
            keepUnusedDataFor: 5,
        }),

        getProductDetail: builder.query({
            query: (productId) => ({
                url: `/${PRODUCT_URL}/${productId}`
                // url: `/api/products/${productId}`,
            }),
            keepUnusedDataFor: 5
        }),
    })
});

export const { useGetProductsQuery, useGetProductDetailQuery } = productsApiSlice;