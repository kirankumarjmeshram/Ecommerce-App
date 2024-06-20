export const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
}

export const updateCart = (state) =>{
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

     return state
}