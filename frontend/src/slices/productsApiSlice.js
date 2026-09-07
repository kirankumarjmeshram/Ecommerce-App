import { PRODUCTS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getReviewEligibility: builder.query({
            query: ({ productId }) => `/${PRODUCTS_URL}/${productId}/review-eligibility`,
            providesTags: (result, error, { productId }) => [{ type: 'Product', id: `eligibility-${productId}` }],
            keepUnusedDataFor: 0,
        }),
        saveReview: builder.mutation({
            query: ({ productId, reviewId, ...body }) => ({ url: `/${PRODUCTS_URL}/${productId}/reviews${reviewId ? `/${reviewId}` : ''}`, method: reviewId ? 'PUT' : 'POST', body }),
            invalidatesTags: ['Product'],
        }),
        deleteReview: builder.mutation({
            query: ({ productId, reviewId }) => ({ url: `/${PRODUCTS_URL}/${productId}/reviews/${reviewId}`, method: 'DELETE' }),
            invalidatesTags: ['Product'],
        }),
        getProducts: builder.query({
            query: (params = {}) => ({
                url: `/${PRODUCTS_URL}`, params,
            }),
            providesTags: ["Product"],// we dont need to refresh the page
            keepUnusedDataFor: 5,
        }),

        getProductCategories: builder.query({
            query: () => ({ url: `/${PRODUCTS_URL}/categories` }),
            providesTags: ['Product'],
        }),
        getProductDetail: builder.query({
            query: (productId) => ({
                url: `/${PRODUCTS_URL}/${productId}`
                // url: `/api/products/${productId}`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Product'],
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
                url: `${PRODUCTS_URL}`,
                method: 'POST',
                body: productData,
            }),
            invalidatesTags: ['Product'],
        }),
        updateProduct: builder.mutation({
            query: (product) => ({
              url: `${PRODUCTS_URL}/${product.productId}`, 
            // url : `/api/products/${product.productId}`,
              method: 'PUT',
              body: product,
            }),
            invalidatesTags: ['Product'],
          }),
        deleteProduct: builder.mutation({
            query: (productId) => ({
                url: `${PRODUCTS_URL}/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
    })
});

export const { useGetProductsQuery, useGetProductCategoriesQuery, useGetProductDetailQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } = productsApiSlice;
export const { useGetReviewEligibilityQuery, useSaveReviewMutation, useDeleteReviewMutation } = productsApiSlice;
