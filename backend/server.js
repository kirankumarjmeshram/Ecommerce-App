import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();
// console.log('Loaded environment variables:', process.env.PORT);
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
const port = process.env.PORT || 5001;

connectDB();

const app = express();

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Cookie parser middleware
app.use(cookieParser())
app.use(cors());

app.get('/', (req, res) => {
    res.send('Api is running');
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})