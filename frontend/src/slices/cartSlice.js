import { createSlice } from "@reduxjs/toolkit"; // we dont need createApi here
import { getStoredCart, updateCart } from "../utils/cartUtils";

const currentUser = JSON.parse(localStorage.getItem("userInfo") || 'null');
const initialOwnerId = currentUser?._id || null;
const initialState = getStoredCart(initialOwnerId) || {
  ownerId: initialOwnerId,
  cartItems: [],
  shippingAddress: {},
  paymentMethod: '',
};
//  {cartItems: [], totalQuantity: 0, totalAmount: 0};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartOwner: (state, action) => {
      const ownerId = action.payload || null;
      const storedCart = getStoredCart(ownerId);
      return storedCart || { ownerId, cartItems: [], shippingAddress: {}, paymentMethod: '' };
    },
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      return updateCart(state);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      return updateCart(state);
    },
    saveShippingAddress: (state, action) => {
        state.shippingAddress = action.payload;
        return updateCart(state);
    },
    savePaymentMethod: (state, action) => {
        state.paymentMethod = action.payload;
        return updateCart(state);
    },
    clearCartItems: (state) =>{
      state.cartItems = [];
      return updateCart(state);
    }
  },
});

export const { 
  setCartOwner,
  addToCart, 
  removeFromCart, 
  saveShippingAddress, 
  savePaymentMethod ,
  clearCartItems
} = cartSlice.actions;

export default cartSlice.reducer;
