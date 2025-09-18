import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser ,findByEmail, findByEmailOrNameOrPhone } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const SignUp = async(req,res,next) =>{
    try{
        const {name,phone,email,password,role} = req.body;
        
        const existing_user = await findByEmailOrNameOrPhone(name,email,phone);

        if(existing_user){
            return res.status(409).json({
                message : 'User already exists...',
            })
        }
        
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password,salt);
        
        const user = await createUser({name,email,phone,hashedPassword,role});

        if(!user){
            throw new Error('user Not Created...');
        }
   
        return res.status(201).json({
            message : 'User Created..',
            user : {
                name,
                email,
                role
            }
        })

    }catch(error){
        return res.status(500).json({
            message : 'internal server error',
            error : error.message
        })
    }
}

export const Login = async(req,res,next) => {
    try {
        const {email,password} = req.body;

        const user = await findByEmail(email);

        if(!user){
            return res.status(404).json({
                success : false,
                message : 'user Not Found...'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({
                success : false,
                message : 'Incorrect credential'
            })
        }
        
        const token = jwt.sign(
            { id: user.id, name: user.name,phone: user.phone, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        return res.status(200).json({
            success : true,
            user : {
                id : user.id,
                name : user.name,
                email : user.email,
                role : user.role
            },
            token
        })

    } catch (error) {
        return res.status(500).json({
            message : 'internal server error',
            error : error.message
        })
    }
}