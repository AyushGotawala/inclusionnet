import { createBorrowerKYC } from '../models/BorrowerProfile.js';
import { createLenderKYC } from '../models/LenderProfile.js';

export const uploadBorrowerKYC = async (req,res,next) =>{
    try{
        const userId = req.user?.id;

        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { income, existing_loans, assets , aadhar_number, pan_number } = req.body;
        const aadharPath = req.files?.['aadhar']?.[0]?.path || null;
        const panPath = req.files?.['pan']?.[0]?.path || null;

        const rows = await createBorrowerKYC({userId,aadhar_number, pan_number, income, existing_loans, assets, aadharPath, panPath});

        return res.status(201).json({
            message: 'Borrower KYC submitted successfully',
            rows : rows[0]
        });
    }catch(error){
        return res.status(500).json({
            message : 'internal server error',
            error : error.message
        })
    }
}

export const uploadLenderKYC = async(req,res,next) =>{
    try{
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {aadhar_number, pan_number, available_funds} = req.body;
        const aadharPath = req.files?.['aadhar']?.[0]?.path || null;
        const panPath = req.files?.['pan']?.[0]?.path || null;

        const rows = await createLenderKYC({userId,aadhar_number,pan_number,aadharPath,panPath,available_funds});

        return res.status(201).json({
            message: 'Lenders KYC submitted successfully',
            rows : rows[0]
        });

    }catch(error){
        return res.status(500).json({
            message : 'internal server error',
            error : error.message
        });
    }
}