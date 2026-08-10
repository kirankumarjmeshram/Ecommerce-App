import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth`,
                method: 'POST',
                body: data,
            }),
            keepUnusedDataFor: 5,
        }),
        register: builder.mutation({
            query:(data) =>({
                url:`${USERS_URL}`,
                method: 'POST',
                body: data
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/logout`,
                method: 'POST',
            })
        }),
        profile: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: data,
            })
        }),
        getUsers: builder.query({
            query: () => ({ url: USERS_URL }),
            providesTags: (result) => result
                ? [...result.map(({ _id }) => ({ type: 'User', id: _id })), { type: 'User', id: 'LIST' }]
                : [{ type: 'User', id: 'LIST' }],
        }),
        getUserDetails: builder.query({
            query: (userId) => ({ url: `${USERS_URL}/${userId}` }),
            providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
        }),
        updateUser: builder.mutation({
            query: ({ userId, ...data }) => ({
                url: `${USERS_URL}/${userId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId },
                { type: 'User', id: 'LIST' },
            ],
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({ url: `${USERS_URL}/${userId}`, method: 'DELETE' }),
            invalidatesTags: (result, error, userId) => [
                { type: 'User', id: userId },
                { type: 'User', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useDeleteUserMutation,
    useGetUserDetailsQuery,
    useGetUsersQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useProfileMutation,
    useUpdateUserMutation,
} = userApiSlice;
