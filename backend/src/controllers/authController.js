import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser ,findByEmail, findByEmailOrNameOrPhone } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('⚠️  JWT_SECRET is not set in environment variables!');
}

export const SignUp = async(req,res,next) =>{
    try{
        const {name,phone,email,password,role} = req.body;
        
        const existing_user = await findByEmailOrNameOrPhone(name,email,phone);

        if(existing_user){
            return res.status(409).json({
                success: false,
                message : 'User already exists with this email, name, or phone number.',
            })
        }
        
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password,salt);
        
        const user = await createUser({name,email,phone,hashedPassword,role});

        if(!user){
            throw new Error('User not created');
        }
   
        return res.status(201).json({
            success: true,
            message : 'User created successfully',
            data : {
                id: user.id,
                name,
                email,
                role
            }
        })

    }catch(error){
        console.error('SignUp Error:', error);
        return res.status(500).json({
            success: false,
            message : 'Internal server error',
            error : error.message
        })
    }
}

export const Login = async(req,res,next) => {
    try {
        const {email,password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Normalize email to lowercase for case-insensitive lookup
        const normalizedEmail = email.toLowerCase().trim();
        
        const user = await findByEmail(normalizedEmail);

        if(!user){
            console.log(`Login attempt failed: User not found for email: ${normalizedEmail}`);
            return res.status(404).json({
                success : false,
                message : 'User not found'
            })
        }

        console.log(`Login attempt for user: ${user.email}, role: ${user.role}`);

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            console.log(`Login attempt failed: Incorrect password for email: ${normalizedEmail}`);
            return res.status(401).json({
                success : false,
                message : 'Incorrect email or password'
            })
        }
        
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error: JWT_SECRET not set'
            });
        }
        
        const token = jwt.sign(
            { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        console.log(`Login successful for user: ${user.email}, role: ${user.role}`);

        return res.status(200).json({
            success : true,
            message: 'Login successful',
            user : {
                id : user.id,
                name : user.name,
                email : user.email,
                role : user.role
            },
            token
        })

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            success: false,
            message : 'Internal server error',
            error : error.message
        })
    }
}