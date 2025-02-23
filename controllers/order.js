import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        // Calculate total amount and verify stock
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.title}` });
            }
            totalAmount += product.price * item.quantity;
        }

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            totalAmount,
            paymentMethod
        });

        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        }

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort('-createdAt');

        res.status(200).json({
            orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
