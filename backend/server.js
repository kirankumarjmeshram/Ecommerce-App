import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
// console.log('Loaded environment variables:', process.env.PORT);
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
const port = process.env.PORT || 5001;

connectDB();

const app = express();
app.use(cors());
app.get('/', (req, res) => {
    res.send('Api is running');
});

app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})