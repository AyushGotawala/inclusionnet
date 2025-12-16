import prisma from '../lib/prisma.js';

/**
 * Create a loan request (from borrower to lender)
 */
export const createLoanRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { loanApplicationId, lenderId, message } = req.body;

    // Validate input
    if (!loanApplicationId || !lenderId) {
      return res.status(400).json({
        success: false,
        message: 'Loan application ID and lender ID are required'
      });
    }

    // Verify loan application belongs to borrower
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id: loanApplicationId },
      include: {
        borrower: {
          include: {
            user: true
          }
        }
      }
    });

    if (!loanApplication) {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found'
      });
    }

    // Verify the loan application belongs to the borrower (check User ID, not BorrowerProfile ID)
    if (loanApplication.borrower.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only send requests for your own loan applications'
      });
    }

    if (loanApplication.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Can only send requests for pending loan applications'
      });
    }

    // Verify lender exists and has approved KYC
    const lender = await prisma.lenderProfile.findUnique({
      where: { userId: lenderId },
      include: {
        user: true
      }
    });

    if (!lender || lender.kyc_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Lender not found or not verified'
      });
    }

    // Check if request already exists
    const existingRequest = await prisma.loanRequest.findUnique({
      where: {
        loanApplicationId_lenderId: {
          loanApplicationId,
          lenderId
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Request already sent to this lender'
      });
    }

    // Create loan request (initiated by BORROWER)
    const loanRequest = await prisma.loanRequest.create({
      data: {
        loanApplicationId,
        borrowerId: userId,
        lenderId,
        initiatedBy: 'BORROWER', // Borrower is sending the request
        message: message || null,
        status: 'PENDING'
      },
      include: {
        loanApplication: {
          select: {
            id: true,
            loanAmount: true,
            loanPurpose: true,
            loanTenureMonths: true
          }
        },
        borrower: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        },
        lender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        }
      }
    });

    // Emit socket notification to lender
    const io = req.app.get('io');
    if (io) {
      const { sendNotificationToUser } = await import('../socket/index.js');
      sendNotificationToUser(io, lenderId, 'new_loan_request', {
        loanRequestId: loanRequest.id,
        borrowerId: userId,
        borrowerName: loanRequest.borrower.name,
        loanApplicationId,
        loanAmount: loanApplication.loanAmount,
        message: loanRequest.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Loan request sent successfully',
      data: loanRequest
    });
  } catch (error) {
    console.error('Error creating loan request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Create a loan offer request (from lender to borrower)
 */
export const createLoanOfferRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { loanApplicationId, message } = req.body;

    // Validate input
    if (!loanApplicationId) {
      return res.status(400).json({
        success: false,
        message: 'Loan application ID is required'
      });
    }

    // Verify lender has approved KYC
    const lenderProfile = await prisma.lenderProfile.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });

    if (!lenderProfile || lenderProfile.kyc_status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'You must have approved KYC to send loan offers'
      });
    }

    // Verify loan application exists and is pending
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id: loanApplicationId },
      include: {
        borrower: {
          include: {
            user: true
          }
        }
      }
    });

    if (!loanApplication) {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found'
      });
    }

    if (loanApplication.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Can only send offers for pending loan applications'
      });
    }

    // Get the borrower's User ID (not BorrowerProfile ID)
    // BorrowerProfile has a userId field that references User.id
    const borrowerUserId = loanApplication.borrower?.userId;
    
    console.log('📝 Creating loan offer request:', {
      loanApplicationId,
      borrowerProfileId: loanApplication.borrowerId,
      borrowerUserId,
      borrowerObject: {
        id: loanApplication.borrower?.id,
        userId: loanApplication.borrower?.userId,
        hasUserRelation: !!loanApplication.borrower?.user
      },
      lenderId: userId,
      loanAmount: loanApplication.loanAmount
    });
    
    // Verify borrowerUserId exists
    if (!borrowerUserId) {
      console.error('❌ ERROR: borrowerUserId is undefined!', {
        loanApplicationId,
        borrowerId: loanApplication.borrowerId,
        borrower: loanApplication.borrower,
        borrowerKeys: loanApplication.borrower ? Object.keys(loanApplication.borrower) : 'borrower is null'
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to get borrower user ID. Please ensure the loan application has a valid borrower.'
      });
    }

    // Check if lender has sufficient funds
    if (lenderProfile.available_funds < loanApplication.loanAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds to fund this loan'
      });
    }

    // Check if request already exists
    const existingRequest = await prisma.loanRequest.findUnique({
      where: {
        loanApplicationId_lenderId: {
          loanApplicationId,
          lenderId: userId
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Request already sent for this loan application'
      });
    }

    // Create loan request (initiated by LENDER)
    console.log('💾 Creating LoanRequest with:', {
      loanApplicationId,
      borrowerId: borrowerUserId,
      lenderId: userId,
      initiatedBy: 'LENDER',
      status: 'PENDING'
    });
    
    const loanRequest = await prisma.loanRequest.create({
      data: {
        loanApplicationId,
        borrowerId: borrowerUserId, // Use User ID, not BorrowerProfile ID
        lenderId: userId,
        initiatedBy: 'LENDER', // Lender is sending the offer
        message: message || null,
        status: 'PENDING'
      },
      include: {
        loanApplication: {
          select: {
            id: true,
            loanAmount: true,
            loanPurpose: true,
            loanTenureMonths: true
          }
        },
        borrower: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        },
        lender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        }
      }
    });

    console.log('✅ LoanRequest created successfully:', {
      id: loanRequest.id,
      borrowerId: loanRequest.borrowerId,
      lenderId: loanRequest.lenderId,
      loanApplicationId: loanRequest.loanApplicationId,
      status: loanRequest.status
    });
    
    // Verify the created request
    const verifyRequest = await prisma.loanRequest.findUnique({
      where: { id: loanRequest.id },
      select: {
        id: true,
        borrowerId: true,
        lenderId: true,
        loanApplicationId: true,
        status: true
      }
    });
    console.log('🔍 Verified request in database:', verifyRequest);

    // Emit socket notification to borrower
    const io = req.app.get('io');
    if (io) {
      const { sendNotificationToUser } = await import('../socket/index.js');
      sendNotificationToUser(io, borrowerUserId, 'new_loan_offer', {
        loanRequestId: loanRequest.id,
        lenderId: userId,
        lenderName: loanRequest.lender.name,
        loanApplicationId,
        loanAmount: loanApplication.loanAmount,
        message: loanRequest.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Loan offer request sent successfully',
      data: loanRequest
    });
  } catch (error) {
    console.error('Error creating loan offer request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Accept a loan request
 */
export const acceptLoanRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { loanRequestId } = req.params;

    // Get loan request
    // Note: borrower and lender are already User models, so we can't include 'user' on them
    const loanRequest = await prisma.loanRequest.findUnique({
      where: { id: Number(loanRequestId) },
      include: {
        loanApplication: {
          select: {
            id: true,
            loanAmount: true,
            loanPurpose: true,
            loanTenureMonths: true,
            status: true
          }
        },
        borrower: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            role: true
          }
        },
        lender: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            role: true
          }
        }
      }
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found'
      });
    }

    // Verify user has permission to accept (must be borrower or lender)
    if (loanRequest.borrowerId !== userId && loanRequest.lenderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to accept this request'
      });
    }

    if (loanRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // Update request status
    const updatedRequest = await prisma.loanRequest.update({
      where: { id: Number(loanRequestId) },
      data: {
        status: 'ACCEPTED'
      },
      include: {
        loanApplication: {
          select: {
            id: true,
            loanAmount: true,
            loanPurpose: true,
            loanTenureMonths: true
          }
        },
        borrower: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        },
        lender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        }
      }
    });

    // Notify the other party via socket
    const io = req.app.get('io');
    if (io) {
      const { sendNotificationToUser } = await import('../socket/index.js');
      const otherUserId = loanRequest.borrowerId === userId 
        ? loanRequest.lenderId 
        : loanRequest.borrowerId;
      
      sendNotificationToUser(io, otherUserId, 'loan_request_accepted', {
        loanRequestId: updatedRequest.id,
        loanApplicationId: updatedRequest.loanApplicationId,
        message: 'Your loan request has been accepted. You can now start chatting!'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan request accepted successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error accepting loan request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Reject a loan request
 */
export const rejectLoanRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { loanRequestId } = req.params;

    const loanRequest = await prisma.loanRequest.findUnique({
      where: { id: Number(loanRequestId) }
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found'
      });
    }

    if (loanRequest.borrowerId !== userId && loanRequest.lenderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reject this request'
      });
    }

    if (loanRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    const updatedRequest = await prisma.loanRequest.update({
      where: { id: Number(loanRequestId) },
      data: {
        status: 'REJECTED'
      }
    });

    // Notify the other party
    const io = req.app.get('io');
    if (io) {
      const { sendNotificationToUser } = await import('../socket/index.js');
      const otherUserId = loanRequest.borrowerId === userId 
        ? loanRequest.lenderId 
        : loanRequest.borrowerId;
      
      sendNotificationToUser(io, otherUserId, 'loan_request_rejected', {
        loanRequestId: updatedRequest.id,
        message: 'Your loan request has been rejected'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan request rejected',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error rejecting loan request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get loan requests for borrower
 */
export const getBorrowerLoanRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Fetching borrower loan requests for userId:', userId);

    // Borrowers should only see requests sent BY lenders TO them
    const requests = await prisma.loanRequest.findMany({
      where: {
        borrowerId: userId,
        initiatedBy: 'LENDER' // Only show requests that lenders sent to this borrower
        // Note: Legacy requests without initiatedBy will not appear (they were likely borrower-initiated)
      },
      include: {
        loanApplication: {
          select: {
            id: true,
            loanAmount: true,
            loanPurpose: true,
            loanTenureMonths: true
          }
        },
        lender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            email: true,
            lenderProfile: {
              select: {
                available_funds: true,
                interest_rate: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: userId,
                isRead: false
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Found', requests.length, 'loan requests for borrower userId:', userId);
    if (requests.length > 0) {
      console.log('📋 Request details:', requests.map(r => ({ 
        id: r.id, 
        borrowerId: r.borrowerId, 
        lenderId: r.lenderId, 
        status: r.status,
        loanApplicationId: r.loanApplicationId
      })));
    } else {
      console.log('⚠️ No requests found. Checking all requests in database...');
      const allRequests = await prisma.loanRequest.findMany({
        select: {
          id: true,
          borrowerId: true,
          lenderId: true,
          status: true,
          loanApplicationId: true
        }
      });
      console.log('📊 All requests in database:', allRequests);
      console.log('🔍 Looking for requests where borrowerId ===', userId);
    }

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error getting borrower loan requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get loan requests for lender
 */
export const getLenderLoanRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Fetching lender loan requests for userId:', userId);

    // Lenders should only see requests sent BY borrowers TO them
    const requests = await prisma.loanRequest.findMany({
      where: {
        lenderId: userId,
        initiatedBy: 'BORROWER' // Only show requests that borrowers sent to this lender
        // Note: Legacy requests without initiatedBy will appear (defaulted to BORROWER in migration)
      },
      include: {
        loanApplication: {
          select: {
            id: true,
            loanAmount: true,
            loanPurpose: true,
            loanTenureMonths: true
          }
        },
        borrower: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            email: true,
            borrowerProfile: {
              select: {
                creditScore: true,
                monthly_income: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: userId,
                isRead: false
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error getting lender loan requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
