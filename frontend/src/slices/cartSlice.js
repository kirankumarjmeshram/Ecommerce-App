import { createSlice } from "@reduxjs/toolkit"; // we dont need createApi here

const initialState = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : {cartItems: []};
//  {cartItems: [], totalQuantity: 0, totalAmount: 0};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {

    }
})

export default cartSlice.reducer;