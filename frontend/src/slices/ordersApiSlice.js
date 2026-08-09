import { apiSlice } from "./apiSlice";
import { ORDERS_URL, PAYMENTS_URL } from "../constants";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: { ...order },
      }),
    }),
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `/${ORDERS_URL}/${orderId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createRazorpayOrder: builder.mutation({
      query: (orderId) => ({
        url: `${PAYMENTS_URL}/razorpay/order/${orderId}`,
        method: "POST",
      }),
    }),
    verifyRazorpayPayment: builder.mutation({
      query: ({ orderId, payment }) => ({
        url: `${PAYMENTS_URL}/razorpay/verify/${orderId}`,
        method: "POST",
        body: payment,
      }),
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `/${ORDERS_URL}/myorders`,
        }),
    }),
    getOrders: builder.query({
      query: () => ({
        url: `/${ORDERS_URL}`,
      }),
      keepUnusedDataFor: 5,
    }),
    deleverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      })
    })
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeleverOrderMutation
} = ordersApiSlice;
