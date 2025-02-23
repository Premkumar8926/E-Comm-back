import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import {rm} from "fs";


//Add new Product
export const createProduct = async (req, res) => {
    try {
        //Check User Role
        if(req.user.role !== "admin") {
            return res.status(403).json({message: "Unauthorized Access"});
        }
        console.log("Received Data:", req.body);
        const {title, description, category, price, stock, mrp} = req.body;
        const image = req.file;

        //Check Image is selected
        if(!image) {
            return res.status(400).json({message: "Please selec the Image"});
        }

        const product = await Product.create({
            title, 
            description, 
            category, 
            price: Number(price), 
            stock,
            image: image?.path,
            mrp: Number(mrp),
        });
        res.status(201).json({
            message: "Product Created Successfully",
            product,
        });

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

//Fetch All Products
export const fetchAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({
            message: "List of Products", length: products.length, products
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

//Fetch Single Product
export const fetchSingleProduct = async (req, res) => {
    try {
        const id = req.params.id;
        //Validate if the ID is a valid MongoDB ObjectId
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Product ID"});
        }
        const product = await Product.findById(id);
        //Check if the product exists
        if(!product) {
            return res.status(404).json({message: "Product Not Found"});
        }
        return res.status(200).json({
            message: "Product Details", product
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

//Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        //Validate if the ID is a valid MongoDB ObjectId
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid Product ID"});
        }
        //Check User Role
        if(req.user.role !== "admin") {
            return res.status(403).json({message: "Unauthorized Access"});
        }
        
        //Select Product to Delete
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(403).json({message: "Invalid Product Details"});
        }
        
        //Delete Image from server
        rm(product.image, () => {
            console.log("Image Deleted Successfully");
        });

        //Delete Product from Database
        await Product.deleteOne();

        return res.json({
            message: "Product Details Deleted Success"
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};