import crypto from 'crypto';
import {
  app, request, User, Product, Order, startDatabase, stopDatabase, resetDatabase, register, createProduct,
} from './helpers.js';

beforeAll(startDatabase);
afterAll(stopDatabase);
beforeEach(resetDatabase);

const address = { address: '1 Test Road', city: 'Nagpur', postalCode: '440001', country: 'India' };
const orderBody = (productId, overrides = {}) => ({
  orderItems: [{ _id: productId, qty: 1, price: 1 }], shippingAddress: address, paymentMethod: 'Razorpay',
  itemsPrice: 1, taxPrice: 0, shippingPrice: 0, totalPrice: 1, ...overrides,
});

test('auth, role protection, request IDs, health, readiness, and metrics work', async () => {
  const customer = request.agent(app);
  await customer.get('/api/orders/myorders').expect(401);
  const { user } = await register(customer);
  await customer.get('/api/orders/myorders').expect(200);
  await customer.get('/api/users').expect(403);
  const admin = await User.create({ name: 'Admin', email: 'admin@test.local', password: 'Password123!', isAdmin: true });
  const adminAgent = request.agent(app);
  await adminAgent.post('/api/users/auth').send({ email: admin.email, password: 'Password123!' }).expect(200);
  const users = await adminAgent.get('/api/users').expect(200);
  expect(users.body.find((entry) => entry._id === user._id)).not.toHaveProperty('password');
  const health = await request(app).get('/health').set('X-Request-Id', 'test-request-1').expect(200);
  expect(health.headers['x-request-id']).toBe('test-request-1');
  await request(app).get('/ready').expect(200);
  const metrics = await request(app).get('/metrics').expect(200);
  expect(metrics.headers['content-type']).toContain('text/plain');
  expect(metrics.text).toContain('http_requests_total');
  expect(metrics.text).toContain('redis_cache_hits_total');
});

test('admin product CRUD validates stock/price and accepts stock zero', async () => {
  const admin = await User.create({ name: 'Admin', email: 'admin@test.local', password: 'Password123!', isAdmin: true });
  const adminAgent = request.agent(app);
  await adminAgent.post('/api/users/auth').send({ email: admin.email, password: 'Password123!' }).expect(200);
  const payload = { name: 'Camera', image: '/camera.jpg', brand: 'Lens', category: 'Tech', description: 'Camera', price: 100, countInStock: 2 };
  const created = await adminAgent.post('/api/products').send(payload).expect(201);
  await adminAgent.put(`/api/products/${created.body._id}`).send({ countInStock: 0 }).expect(200).expect(({ body }) => expect(body.countInStock).toBe(0));
  await adminAgent.put(`/api/products/${created.body._id}`).send({ countInStock: -1 }).expect(400);
  await adminAgent.put(`/api/products/${created.body._id}`).send({ price: -1 }).expect(400);
  await request(app).get('/api/products/not-an-id').expect(400);
  await adminAgent.delete(`/api/products/${created.body._id}`).expect(200);
  await request(app).get(`/api/products/${created.body._id}`).expect(404);
});

test('orders use MongoDB pricing and enforce owner/admin delivery access', async () => {
  const owner = request.agent(app); await register(owner, { email: 'owner@test.local' });
  const other = request.agent(app); await register(other, { email: 'other@test.local' });
  const product = await createProduct({ price: 1000, countInStock: 1 });
  const created = await owner.post('/api/orders').send(orderBody(product._id.toString())).expect(201);
  expect(created.body.itemsPrice).toBe(1000);
  expect(created.body.shippingPrice).toBe(100);
  expect(created.body.taxPrice).toBe(120);
  expect(created.body.totalPrice).toBe(1220);
  await owner.post('/api/orders').send(orderBody(product._id.toString(), { orderItems: [{ _id: product._id, qty: 2 }] })).expect(400);
  await other.get(`/api/orders/${created.body._id}`).expect(403);
  await other.put(`/api/orders/${created.body._id}/deliver`).expect(403);
  const admin = await User.create({ name: 'Admin', email: 'admin@test.local', password: 'Password123!', isAdmin: true });
  const adminAgent = request.agent(app); await adminAgent.post('/api/users/auth').send({ email: admin.email, password: 'Password123!' }).expect(200);
  await adminAgent.get(`/api/orders/${created.body._id}`).expect(200);
  const delivered = await adminAgent.put(`/api/orders/${created.body._id}/deliver`).expect(200);
  expect(delivered.body.isDelivered).toBe(true); expect(delivered.body.deliveredAt).toBeTruthy();
});

test('Razorpay verification rejects another user, bad signature, and duplicate payment', async () => {
  const owner = request.agent(app); await register(owner, { email: 'owner@test.local' });
  const other = request.agent(app); await register(other, { email: 'other@test.local' });
  const product = await createProduct();
  const order = await owner.post('/api/orders').send(orderBody(product._id.toString())).expect(201);
  await Order.findByIdAndUpdate(order.body._id, { paymentResult: { razorpayOrderId: 'order_test_1', provider: 'razorpay' } });
  await other.post(`/api/payments/razorpay/verify/${order.body._id}`).send({ razorpay_order_id: 'order_test_1', razorpay_payment_id: 'pay_1', razorpay_signature: 'x' }).expect(403);
  await owner.post(`/api/payments/razorpay/verify/${order.body._id}`).send({ razorpay_order_id: 'order_test_1', razorpay_payment_id: 'pay_1', razorpay_signature: 'bad' }).expect(400);
  const signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update('order_test_1|pay_1').digest('hex');
  await owner.post(`/api/payments/razorpay/verify/${order.body._id}`).send({ razorpay_order_id: 'order_test_1', razorpay_payment_id: 'pay_1', razorpay_signature: signature }).expect(200);
  await owner.post(`/api/payments/razorpay/verify/${order.body._id}`).send({ razorpay_order_id: 'order_test_1', razorpay_payment_id: 'pay_1', razorpay_signature: signature }).expect(200);
});
