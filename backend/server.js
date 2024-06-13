import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
// console.log('Loaded environment variables:', process.env.PORT);
import connectDB from './config/db.js';
import producRoutes from './routes/productRoutes.js';
const port = process.env.PORT || 5001;

connectDB();

const app = express();
app.use(cors());
app.get('/',(req, res)=>{
    res.send('Api is running');
});

app.use('/api/products', producRoutes);

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
});
