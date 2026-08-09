import { Link, useParams } from "react-router-dom";
import Message from "../components/Message";
import { Row, Col, ListGroup, Image, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import loadRazorpayScript from "../utils/loadRazorpayScript";
import {
  useGetOrderDetailsQuery,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useDeleverOrderMutation,
} from "../slices/ordersApiSlice";

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const { data: order, isLoading, error, refetch } = useGetOrderDetailsQuery(orderId);
  const [createRazorpayOrder, { isLoading: loadingRazorpayOrder }] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment, { isLoading: verifyingPayment }] = useVerifyRazorpayPaymentMutation();
  const [deleverOrder, { isLoading: loadingDeliver }] = useDeleverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const payNowHandler = async () => {
    try {
      await loadRazorpayScript();
      const razorpayOrder = await createRazorpayOrder(orderId).unwrap();

      const checkout = new window.Razorpay({
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Ecommerce App",
        description: `Payment for order ${order._id}`,
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
        },
        handler: async (payment) => {
          try {
            await verifyRazorpayPayment({ orderId, payment }).unwrap();
            toast.success("Payment verified successfully");
            refetch();
          } catch (err) {
            toast.error(err?.data?.message || err?.error || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => toast.info("Payment was cancelled"),
        },
        theme: { color: "#0d6efd" },
      });

      checkout.on("payment.failed", () => toast.error("Payment failed. Your order remains unpaid."));
      checkout.open();
    } catch (err) {
      toast.error(err?.data?.message || err?.error || err?.message || "Unable to start Razorpay Checkout");
    }
  };

  const deliverOrderHandler = async () => {
    try {
      await deleverOrder(orderId).unwrap();
      refetch();
      toast.success("Order Delivered");
    } catch (err) {
      toast.error(err?.data?.message || err?.error || "Unable to update delivery status");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message || error?.error}</Message>;

  return (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p><strong>Name: </strong>{order.user.name}</p>
              <p><strong>Email: </strong>{order.user.email}</p>
              <p><strong>Address: </strong>{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
              {order.isDelivered ? <Message variant="success">Delivered on {order.deliveredAt}</Message> : <Message variant="danger">Not Delivered</Message>}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Payment</h2>
              <p><strong>Method: </strong>{order.paymentMethod}</p>
              {order.isPaid ? <Message variant="success">Paid on {order.paidAt}</Message> : <Message variant="danger">Not Paid</Message>}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.map((item) => (
                <ListGroup.Item key={item.product}>
                  <Row>
                    <Col md={1}><Image src={item.image} alt={item.name} fluid rounded /></Col>
                    <Col><Link to={`/product/${item.product}`}>{item.name}</Link></Col>
                    <Col md={4}>{item.qty} x ₹{item.price} = ₹{item.qty * item.price}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item><h2>Order Summary</h2></ListGroup.Item>
              <ListGroup.Item>
                <Row><Col>Items</Col><Col>₹{order.itemsPrice}</Col></Row>
                <Row><Col>Shipping</Col><Col>₹{order.shippingPrice}</Col></Row>
                <Row><Col>Tax</Col><Col>₹{order.taxPrice}</Col></Row>
                <Row><Col>Total</Col><Col>₹{order.totalPrice}</Col></Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  {(loadingRazorpayOrder || verifyingPayment) && <Loader />}
                  <Button type="button" className="btn-block" onClick={payNowHandler} disabled={loadingRazorpayOrder || verifyingPayment}>
                    Pay Now with Razorpay
                  </Button>
                </ListGroup.Item>
              )}
              {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  {loadingDeliver && <Loader />}
                  <Button onClick={deliverOrderHandler} type="button" className="btn btn-primary" disabled={loadingDeliver}>
                    Mark as Delivered
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
