import mongoose from "mongoose";
import UserInfo from "../models/userInfo.js";

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signin = async (req, res)=> {
    const { email, password } = req.body;
    try{
        const existingUser = await UserInfo.findOne({ email });
        
        if(!existingUser) return res.status(404).json({message: "Please check your email."});
        
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid Credentials. Password not correct. Place check again."});

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id}, 'secretToken', { expiresIn: '1h'});

        res.status(200).json({ result: existingUser, token });
    } catch(error){
        res.status(500).json({message: 'Something went wrong'});
    }
}

export const signup = async (req, res)=> {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    try{
        const existingUser = await UserInfo.findOne({ email });
        if(existingUser) return res.status(404).json({message: "Email already signed up."});

        if(password !== confirmPassword) return res.status(404).json({message: "Passwords not matched"});

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await UserInfo.create({ email, password: hashedPassword, name: `${firstName} ${lastName}`});

        const token = jwt.sign({ email: result.email, id: result._id}, 'secretToken', { expiresIn: '1h'});

        res.status(200).json({ result: result, token });
    } catch(error){
        res.status(500).json({message: 'Something went wrong'});
    }
}