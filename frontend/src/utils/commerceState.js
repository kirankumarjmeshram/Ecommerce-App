export const fulfillmentStatus = (order) => order.isDelivered ? 'Delivered' : order.orderStatus || 'Placed';
export const nextFulfillment = (order) => order.isPaid ? ({ Placed: 'Processing', Processing: 'Shipped', Shipped: 'Delivered' }[fulfillmentStatus(order)] || null) : null;
export const eligibilityMessage = (state) => ({ not_purchased: 'Purchase this product to leave a review.', awaiting_payment: 'Your order must be paid and delivered before you can review this product.', awaiting_delivery: 'You can review this product after it has been delivered.' }[state] || '');
