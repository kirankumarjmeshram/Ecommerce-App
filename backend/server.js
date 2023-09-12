import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import producRoutes from './routes/productRoutes.js';
const port = process.env.PORT || 8000;

connectDB();
const app = express();

app.get('/',(req, res)=>{
    res.send('Api is running');
});

app.use('/api/products', producRoutes);

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
});