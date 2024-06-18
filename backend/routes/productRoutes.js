import express from 'express';
const router = express.Router();
import { getProducts, getProductById } from '../controllers/productController.js';

// router.get('/', asyncHandler(async (req, res)=>{
//     const products = await Product.find({}); // passing empty object to get all
//     res.json(products);
// }));

// router.get('/:id', asyncHandler(async(req, res)=>{
//     const product = await Product.findById(req.params.id);
//     if(product){
//         return res.json(product);
//     } else {
//         // res.status(404).json('Product not found' );// shows html page
//         res.status(404);
//         throw new Error('Resource not found');// no more html page 
//     }
// }));

router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

export default router;