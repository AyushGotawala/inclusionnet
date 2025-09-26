import { createBorrowerKYC, getAllPendingBorrowerKYC, updateBorrowerKYC } from '../models/BorrowerProfile.js';
import { createLenderKYC, getAllPendingLenderKYC, updateLenderKYC } from '../models/LenderProfile.js';

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

export const getBorrowerKYCList = async(req,res,next) =>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const rows = await getAllPendingBorrowerKYC();

        return res.status(201).json({
            rows : rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            message : 'internal server error',
            error : error.message
        });
    }
}

export const verifyBorrowerKYC = async(req,res,next) =>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {id,updatedStatus} = req.body;

        const rows = await updateBorrowerKYC(id,updatedStatus);

        if (rows.length === 0) {
            // no record updated
            return res.status(404).json({ message: "Borrower KYC Record not found" });
        }

        const {kyc_status} = rows[0];

        return res.status(200).json({
            kyc_status : kyc_status,
            rows : rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            message : 'internal server error',
            error : error.message
        });
    }
}

export const getLenderKYCList = async(req,res,next) =>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const rows = await getAllPendingLenderKYC();

        return res.status(201).json({
            rows : rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            message : 'internal server error',
            error : error.message
        });
    }
}

export const verifyLenderKYC = async(req,res,next) =>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {id,updatedStatus} = req.body;

        const rows = await updateLenderKYC(id,updatedStatus);

        if (rows.length === 0) {
            // no record updated
            return res.status(404).json({ message: "Lender KYC Record not found" });
        }

        const {kyc_status} = rows[0];

        return res.status(200).json({
            kyc_status : kyc_status,
            rows : rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            message : 'internal server error',
            error : error.message
        });
    }
}
