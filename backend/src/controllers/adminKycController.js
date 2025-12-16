import {
  getAllPendingBorrowerKYC,
  updateBorrowerKYC,
} from "../models/BorrowerProfile.js";

import {
  getAllPendingLenderKYC,
  updateLenderKYC,
} from "../models/LenderProfile.js";

import prisma from '../lib/prisma.js';

// Admin functions to get all Borrower KYC records
export const getAllBorrowerKYC = async (req, res, next) => {
  try {
    console.log('📋 Get Borrower KYC List - User:', req.user);
    
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      console.warn('⚠️ Access denied - User role:', req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    console.log('✅ Admin access confirmed, fetching borrower KYC list...');
    const kycList = await getAllPendingBorrowerKYC();
    console.log(`✅ Found ${kycList.length} borrower KYC records`);
    
    return res.status(200).json({
      success: true,
      message: "Borrower KYC list retrieved successfully",
      data: kycList,
    });
  } catch (error) {
    console.error('❌ Get Borrower KYC List Error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBorrowerKYCStatus = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    const { userId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved', 'rejected', or 'pending'",
      });
    }

    const result = await updateBorrowerKYC({ userId: Number(userId), kyc_status: status });
    
    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Borrower KYC not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Borrower KYC status updated successfully",
      data: result[0],
    });
  } catch (error) {
    console.error('Update Borrower KYC Status Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin functions to get all Lender KYC records
export const getAllLenderKYC = async (req, res, next) => {
  try {
    console.log('📋 Get Lender KYC List - User:', req.user);
    
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      console.warn('⚠️ Access denied - User role:', req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    console.log('✅ Admin access confirmed, fetching lender KYC list...');
    const kycList = await getAllPendingLenderKYC();
    console.log(`✅ Found ${kycList.length} lender KYC records`);
    
    return res.status(200).json({
      success: true,
      message: "Lender KYC list retrieved successfully",
      data: kycList,
    });
  } catch (error) {
    console.error('❌ Get Lender KYC List Error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateLenderKYCStatus = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    const { userId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved', 'rejected', or 'pending'",
      });
    }

    // Find lender profile by userId
    const lenderProfile = await prisma.lenderProfile.findUnique({
      where: { userId: Number(userId) }
    });

    if (!lenderProfile) {
      return res.status(404).json({
        success: false,
        message: "Lender KYC not found",
      });
    }

    const result = await updateLenderKYC(lenderProfile.id, status);
    
    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lender KYC not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lender KYC status updated successfully",
      data: result[0],
    });
  } catch (error) {
    console.error('Update Lender KYC Status Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};