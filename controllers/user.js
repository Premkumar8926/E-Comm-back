import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../middleware/sendMail.js";

//New User Registration
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, contact } = req.body;
        //Code to check email address already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User Email Already Exists",
            });
        }
        //Code to convert raw password to hashed password
        const hashPassword = await bcrypt.hash(password, 10);

        //Generate OTP
        const otp = Math.floor(Math.random() * 1000000);
        
        //Create New User Data
        user = { name, email, hashPassword, contact };

        //Create signed activation token
        const activationToken = jwt.sign({ user, otp }, process.env.ACTIVATION_SECRET, {
            expiresIn: "5m",
        });

        //Send Email
        const message = `Please Verify your account using otp your otp is ${otp}`;
        await sendMail(email, "Welcome to Prem Kumar", message);

        return res.status(200).json({
            message: "OTP Sent to your mail",
            activationToken,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

//Verify OTP
export const verifyUser = async (req, res) => {
    try {
        const { otp, activationToken } = req.body;
        const verify=jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
        if (!verify) {
            return res.json({
                message: "OTP Expired",
            });
        }

        if (verify.otp !== otp) {
            return res.json({
                message: "Wrong OTP",
            });
        }

        await User.create({
            name: verify.user.name,
            email: verify.user.email,
            password: verify.user.hashPassword,
            contact: verify.user.contact,
        });
        return res.status(200).json({
            message: "User Registered Successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}; 

//Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Check User Email Address
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials",
            });
        }
        //Check Password
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(400).json({
                message: "Invalid Credentials",
            });
        }
        //Generate Signed Token
        const token = jwt.sign({ _id: user.id},process.env.JWT_SECRET, { expiresIn: "15d" });

        //Exclude the password field before sending the response
        const { password: userPassword, ...userDetails } = user.toObject();
        return res.status(200).json({
            message: `Welcome ${user.name}`,
            token,
            user: userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

//User  Profile
export const myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        return res.status(200).json({
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};