import { app, request, User, Product, Order, startDatabase, stopDatabase, resetDatabase, register, createProduct } from './helpers.js';
beforeAll(startDatabase);
afterAll(stopDatabase);
let buyer, user, product, adminAgent;
const review = { rating: 4, title: 'Good quality', comment: 'Matches the description.' };
beforeEach(async () => {
  await resetDatabase(); buyer = request.agent(app); ({ user } = await register(buyer)); product = await createProduct();
  const admin = await User.create({ name: 'Admin', email: 'admin@test.local', password: 'Password123!', isAdmin: true });
  adminAgent = request.agent(app); await adminAgent.post('/api/users/auth').send({ email: admin.email, password: 'Password123!' }).expect(200);
});
const purchase = async (flags = {}) => Order.create({ user: user._id, orderItems: [{ product: product._id, name: product.name, image: product.image, qty: 1, price: product.price }], shippingAddress: { address: '1 Road', city: 'Nagpur', postalCode: '440001', country: 'India' }, paymentMethod: 'Razorpay', ...flags });
const url = () => `/api/products/${product._id}/reviews`;
test('anonymous and non-buyers cannot review or forge eligibility', async () => {
  await request(app).post(url()).send(review).expect(401);
  await buyer.post(url()).send({ ...review, verifiedPurchase: true }).expect(403);
});
test.each([{ isPaid: false, isDelivered: false }, { isPaid: true, isDelivered: false }, { isPaid: false, isDelivered: true }])('purchase flags must both be true: %j', async (flags) => {
  await purchase(flags); await buyer.post(url()).send(review).expect(403);
});
test('verified review uses server identity and atomically prevents duplicates', async () => {
  await purchase({ isPaid: true, isDelivered: true });
  const responses = await Promise.all([buyer.post(url()).send({ ...review, user: 'forged', name: 'Forged', verifiedPurchase: false }), buyer.post(url()).send(review)]);
  expect(responses.map((r) => r.status).sort()).toEqual([201, 409]);
  const saved = await Product.findById(product._id);
  expect(saved.reviews).toHaveLength(1); expect(saved.rating).toBe(4); expect(saved.numReviews).toBe(1);
  expect(saved.reviews[0].verifiedPurchase).toBe(true); expect(String(saved.reviews[0].user)).toBe(user._id); expect(saved.reviews[0].name).toBe(user.name);
});
test.each([{ rating: 0 }, { rating: 6 }, { rating: 1.5 }, { title: ' ' }, { comment: '' }, { title: 'x'.repeat(121) }, { comment: '<script>bad</script>' }])('review validation %j', async (invalid) => {
  await purchase({ isPaid: true, isDelivered: true }); await buyer.post(url()).send({ ...review, ...invalid }).expect(400);
});
test('owner edits; another user and admin cannot edit; owner/admin delete recalculates', async () => {
  await purchase({ isPaid: true, isDelivered: true }); await buyer.post(url()).send(review).expect(201);
  let saved = await Product.findById(product._id); const endpoint = `${url()}/${saved.reviews[0]._id}`;
  const other = request.agent(app); await register(other, { email: 'other@test.local' });
  await other.put(endpoint).send(review).expect(403); await other.delete(endpoint).expect(403);
  await adminAgent.put(endpoint).send(review).expect(403);
  await buyer.put(endpoint).send({ ...review, rating: 2, verifiedPurchase: false }).expect(200);
  saved = await Product.findById(product._id); expect(saved.rating).toBe(2); expect(saved.reviews[0].verifiedPurchase).toBe(true);
  await buyer.delete(endpoint).expect(200); saved = await Product.findById(product._id); expect(saved.rating).toBe(0); expect(saved.numReviews).toBe(0);
  await buyer.post(url()).send(review).expect(201); saved = await Product.findById(product._id);
  await adminAgent.delete(`${url()}/${saved.reviews[0]._id}`).expect(200); expect((await Product.findById(product._id)).numReviews).toBe(0);
});
test('fulfillment enforces paid, sequential admin transitions and enables review', async () => {
  const order = await purchase(); const endpoint = `/api/orders/${order._id}/fulfillment`;
  await buyer.put(endpoint).send({ orderStatus: 'Processing' }).expect(403);
  await adminAgent.put(endpoint).send({ orderStatus: 'Processing', isPaid: true }).expect(409);
  expect((await Order.findById(order._id)).isPaid).toBe(false);
  await Order.findByIdAndUpdate(order._id, { isPaid: true });
  await adminAgent.put(endpoint).send({ orderStatus: 'Delivered' }).expect(409);
  for (const orderStatus of ['Processing', 'Shipped', 'Delivered']) await adminAgent.put(endpoint).send({ orderStatus, deliveredAt: '2000-01-01' }).expect(200);
  const saved = await Order.findById(order._id); expect(saved.isDelivered).toBe(true); expect(saved.deliveredAt.getFullYear()).toBe(new Date().getFullYear());
  await adminAgent.put(endpoint).send({ orderStatus: 'Processing' }).expect(409);
  await buyer.get(`/api/orders/${order._id}`).expect(200);
  const eligibility = await buyer.get(`/api/products/${product._id}/review-eligibility`).expect(200); expect(eligibility.body.state).toBe('eligible');
  await buyer.post(url()).send(review).expect(201);
});
test('suspension rejects existing sessions, reactivation restores access, history prevents deletion', async () => {
  await buyer.put(`/api/users/${user._id}`).send({ status: 'suspended' }).expect(403);
  await adminAgent.put(`/api/users/${user._id}`).send({ status: 'suspended' }).expect(200);
  await buyer.get('/api/users/profile').expect(403); await buyer.put('/api/users/profile').send({ name: 'Changed' }).expect(403);
  await buyer.post('/api/orders').send({}).expect(403); await buyer.post(url()).send(review).expect(403);
  await adminAgent.put(`/api/users/${user._id}`).send({ status: 'active' }).expect(200);
  await buyer.get('/api/users/profile').expect(200);
  await purchase(); await adminAgent.delete(`/api/users/${user._id}`).expect(409);
  const unused = await User.create({ name: 'Unused', email: 'unused@test.local', password: 'Password123!' });
  await adminAgent.delete(`/api/users/${unused._id}`).expect(200);
});
test('review history alone protects user deletion and legacy delivered orders remain delivered', async () => {
  await Product.findByIdAndUpdate(product._id, { $push: { reviews: { user: user._id, name: user.name, rating: 3, comment: 'Legacy review' } } });
  await adminAgent.delete(`/api/users/${user._id}`).expect(409);
  const order = await purchase({ isPaid: true, isDelivered: true }); await Order.collection.updateOne({ _id: order._id }, { $unset: { orderStatus: '' } });
  expect((await buyer.get(`/api/orders/${order._id}`).expect(200)).body.orderStatus).toBe('Delivered');
});
