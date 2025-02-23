import express from 'express';
import { isAuth } from '../middleware/isAuth.js';
import { 
    createOrder, 
    getUserOrders, 
    getOrderDetails, 
    updateOrderStatus 
} from '../controllers/order.js';

const router = express.Router();

router.post('/order/create', isAuth, createOrder);
router.get('/order/my-orders', isAuth, getUserOrders);
router.get('/order/:id', isAuth, getOrderDetails);
router.put('/order/:id/status', isAuth, updateOrderStatus);

export default router;
