import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    mrp: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String,
        required: true,
    },
    sold: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export const Product = mongoose.model("Product", schema);