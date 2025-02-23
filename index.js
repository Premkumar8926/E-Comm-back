import express from "express";
import dotenv from "dotenv";
import connectDb from "./database/db.js";
import cors from "cors";
import orderRoutes from "./routes/order.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

// CORS configuration should be at the top of middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//middleware
app.use(express.json());

//Importing Routes
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";

//using routes
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

//Static Files
app.use("/uploads", express.static("uploads"));

app.listen(port, ()=> {
    console.log(`Server is running on http://localhost:${port}`);
    connectDb();
});
