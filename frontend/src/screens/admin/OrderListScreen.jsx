import PageHeader from '../../components/PageHeader';
import formatCurrency from '../../utils/formatCurrency';
import { LinkContainer } from "react-router-bootstrap";
import { Table, Button } from "react-bootstrap";
import StatusBadge from '../../components/StatusBadge';
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { useGetOrdersQuery } from "../../slices/ordersApiSlice";

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  return (
    <>
      <PageHeader eyebrow="Store administration" title="Orders" description="Review purchases, payments and delivery status." />
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error?.error || "Unable to load orders"}</Message>
      ) : (
        <Table striped hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={7} className="text-center py-4">No orders yet. New purchases will appear here.</td></tr>}
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user && order.user.name}</td>
                <td>{order.createdAt ? order.createdAt.substring(0, 10) : "N/A"}</td>
                <td>{formatCurrency(order.totalPrice)}</td>
                <td>
                  {order.isPaid ? (
                    <StatusBadge positive>Paid</StatusBadge>
                  ) : (
                    <StatusBadge positive={false}>Pending</StatusBadge>
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    <StatusBadge positive>Delivered</StatusBadge>
                  ) : (
                    <StatusBadge positive={false}>Pending</StatusBadge>
                  )}
                </td>
                <td>
                  <LinkContainer to={`/order/${order._id}`}>
                    <Button variant="light" className="btn-sm">
                      Details
                    </Button>
                  </LinkContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderListScreen;
