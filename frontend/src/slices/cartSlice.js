import { createSlice } from "@reduxjs/toolkit"; // we dont need createApi here

const initialState = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : { cartItems: [] };
//  {cartItems: [], totalQuantity: 0, totalAmount: 0};

const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item.__id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) => x._id === existItem._id ? item : x)
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            //calculate the item price
            state.itemPrice = addDecimals(state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));

            //calculate shipping price (if order is over 1000 then free, else 100 shipping )
            state.shippingPrice = addDecimals(state.itemPrice > 1000 ? 0 : 100);

            //calculate tax price (lets say 12%)
            state.taxPrice = addDecimals(Number((0.12 * state.itemPrice).toFixed(2)));

            //calculate total price
            state.totalPrice = (
                Number(state.itemPrice) +
                Number(state.shippingPrice) +
                Number(state.taxPrice)
            ).toFixed(2);

            localStorage.setItem('cart', JSON.stringify(state));
        },
    },
})

export const { addToCart } = cartSlice.actions;
export default cartSlice.reducer;

