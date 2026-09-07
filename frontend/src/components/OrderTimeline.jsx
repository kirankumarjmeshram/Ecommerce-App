import { fulfillmentStatus } from '../utils/commerceState';
const OrderTimeline = ({ order }) => {
  const status = fulfillmentStatus(order);
  const steps = [['Order placed', true], ['Payment confirmed', order.isPaid], ['Processing', Boolean(order.processingAt)], ['Shipped', Boolean(order.shippedAt)], ['Delivered', order.isDelivered]];
  return <section className="order-tracking"><h2>Order tracking</h2><p>Payment: {order.isPaid ? 'Paid' : 'Pending'} · Fulfillment: {status} · Delivery: {order.isDelivered ? 'Delivered' : 'Pending'}</p><ol className="order-timeline">{steps.map(([label, complete]) => <li key={label} className={complete ? 'complete' : ''}><span aria-hidden="true">{complete ? '✓' : '○'}</span> {label}<span className="visually-hidden">{complete ? ' complete' : ' not confirmed'}</span></li>)}</ol></section>;
};
export default OrderTimeline;
