import prisma from '../lib/prisma.js';

function toNumber(val) {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(val) {
  if (val === undefined || val === null || val === "") return null;
  return String(val);
}

/**
 * Create a new loan application
 */
export const createLoanApplication = async ({
  borrowerId,
  loanAmount,
  loanPurpose,
  loanTenureMonths,
}) => {
  // Validate required fields
  if (!borrowerId || !loanAmount || !loanPurpose || !loanTenureMonths) {
    throw new Error('Missing required fields: borrowerId, loanAmount, loanPurpose, loanTenureMonths');
  }

  // Convert and validate numbers
  const loanAmountNum = typeof loanAmount === 'number' ? loanAmount : Number(loanAmount);
  const loanTenureNum = typeof loanTenureMonths === 'number' ? loanTenureMonths : Number(loanTenureMonths);
  const borrowerIdNum = typeof borrowerId === 'number' ? borrowerId : Number(borrowerId);

  // Validate that numbers are valid
  if (isNaN(loanAmountNum) || loanAmountNum <= 0) {
    throw new Error('Loan amount must be a valid number greater than 0');
  }
  if (isNaN(loanTenureNum) || loanTenureNum <= 0) {
    throw new Error('Loan tenure must be a valid number greater than 0');
  }
  if (isNaN(borrowerIdNum) || borrowerIdNum <= 0) {
    throw new Error('Invalid borrower ID');
  }

  const data = {
    borrowerId: borrowerIdNum,
    loanAmount: loanAmountNum,
    loanPurpose: String(loanPurpose).trim(),
    loanTenureMonths: loanTenureNum,
    status: 'PENDING', // LoanStatus enum value
  };

  const application = await prisma.loanApplication.create({
    data,
    include: {
      borrower: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  return application;
};

/**
 * Get all loan applications for a borrower
 */
export const getBorrowerLoanApplications = async (borrowerId) => {
  const applications = await prisma.loanApplication.findMany({
    where: { borrowerId },
    orderBy: { createdAt: 'desc' },
    include: {
      borrower: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return applications;
};

/**
 * Get all loan applications (for admin)
 */
export const getAllLoanApplications = async (filters = {}) => {
  const where = {};
  
  if (filters.status) {
    where.status = filters.status;
  }

  const applications = await prisma.loanApplication.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      borrower: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  return applications;
};

/**
 * Get a single loan application by ID
 */
export const getLoanApplicationById = async (applicationId) => {
  const application = await prisma.loanApplication.findUnique({
    where: { id: applicationId },
    include: {
      borrower: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  return application;
};

/**
 * Update loan application status (for admin)
 */
export const updateLoanApplicationStatus = async ({
  applicationId,
  status,
  adminRemarks,
  creditScore,
}) => {
  const updateData = {
    status,
  };

  if (adminRemarks !== undefined) {
    updateData.adminRemarks = toStringOrNull(adminRemarks);
  }

  if (creditScore !== undefined) {
    updateData.creditScore = toNumber(creditScore);
  }

  const application = await prisma.loanApplication.update({
    where: { id: applicationId },
    data: updateData,
    include: {
      borrower: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  return application;
};

/**
 * Check if borrower has any pending loan applications
 */
export const hasPendingLoanApplications = async (borrowerId) => {
  const pendingApplications = await prisma.loanApplication.findFirst({
    where: {
      borrowerId,
      status: {
        in: ['PENDING', 'UNDER_REVIEW'],
      },
    },
  });

  return !!pendingApplications;
};

/**
 * Get pending loan applications count for a borrower
 */
export const getPendingLoanApplicationsCount = async (borrowerId) => {
  const count = await prisma.loanApplication.count({
    where: {
      borrowerId,
      status: {
        in: ['PENDING', 'UNDER_REVIEW'],
      },
    },
  });

  return count;
};

