import { PRODUCT_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: () => ({
                url: `/${PRODUCT_URL}`
            }),
            providesTags: ["Product"],// we dont need to refresh the page
            keepUnusedDataFor: 5,
        }),

        getProductDetail: builder.query({
            query: (productId) => ({
                url: `/${PRODUCT_URL}/${productId}`
                // url: `/api/products/${productId}`,
            }),
            keepUnusedDataFor: 5
        }),
        // createProduct: builder.mutation({
        //     query: () =>({
        //         url:`${PRODUCT_URL}`,
        //         method: 'POST',
        //     }),
        //     invalidatesTags: ['Product'], // stops it for being cached so that we have fresh data
        // }),
        createProduct: builder.mutation({
            query: (productData) => ({
                url: `${PRODUCT_URL}`,
                method: 'POST',
                body: productData,
            }),
            invalidatesTags: ['Product'],
        }),
        updateProduct: builder.mutation({
            query: (product) => ({
              url: `${PRODUCT_URL}/${product.productId}`, 
            // url : `/api/products/${product.productId}`,
              method: 'PUT',
              body: product,
            }),
            invalidatesTags: ['Products'],
          }),
    })
});

export const { useGetProductsQuery, useGetProductDetailQuery, useCreateProductMutation, useUpdateProductMutation } = productsApiSlice;