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
        createProduct: builder.mutation({
            query: () =>({
                url:`${PRODUCT_URL}`,
                method: 'POST',
            }),
            invalidatesTags: ['Product'], // stops it for being cached so that we have fresh data
        }),
        updateProduct: builder.mutation({
            query: (data) =>({
                url:`${PRODUCT_URL}/${data._id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags:['Product'],
        })
    })
});

export const { useGetProductsQuery, useGetProductDetailQuery, useCreateProductMutation, useUpdateProductMutation } = productsApiSlice;