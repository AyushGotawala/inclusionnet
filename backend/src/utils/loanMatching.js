import prisma from '../lib/prisma.js';

/**
 * Get matching lenders for a borrower's loan application
 * Returns lenders who can fully fund the loan
 * 
 * @param {Object} params
 * @param {number} params.loanApplicationId - The loan application ID
 * @param {number} [params.take=10] - Page size
 * @param {number} [params.cursorId] - Lender ID to cursor from (for pagination)
 * @param {number} [params.maxInterestRate] - Optional max interest rate filter
 * @returns {Promise<{items: Array, nextCursor: number|null}>}
 */
export async function getMatchingLendersForLoan(params) {
  const { loanApplicationId, take = 10, cursorId, maxInterestRate } = params;

  // 1. Fetch the loan application
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanApplicationId },
    select: {
      id: true,
      loanAmount: true,
      loanTenureMonths: true,
      status: true,
      borrowerId: true,
    },
  });

  if (!loan) {
    throw new Error('Loan application not found');
  }

  if (loan.status !== 'PENDING') {
    return { items: [], nextCursor: null };
  }

  // 2. Build where clause for matching lenders
  const whereClause = {
    available_funds: { gte: loan.loanAmount },
    kyc_status: 'approved',
    // Ensure available_funds is not null and positive
    NOT: { available_funds: null },
  };

  // Optional: Filter by max interest rate
  if (typeof maxInterestRate === 'number') {
    whereClause.interest_rate = { lte: maxInterestRate };
  }

  // 3. Build query args with cursor pagination
  const queryArgs = {
    where: whereClause,
    orderBy: { id: 'asc' }, // Deterministic pagination
    take: take,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  };

  if (cursorId) {
    queryArgs.cursor = { id: cursorId };
    queryArgs.skip = 1; // Skip the cursor item
  }

  const lenders = await prisma.lenderProfile.findMany(queryArgs);

  const nextCursor = lenders.length === take ? lenders[lenders.length - 1].id : null;

  // 4. Map response (mask PII, exclude internal fields)
  const items = lenders.map((l) => ({
    id: l.id,
    userId: l.userId,
    lenderName: l.user?.name || 'Anonymous',
    available_funds: l.available_funds,
    interest_rate: l.interest_rate,
    kyc_status: l.kyc_status,
    hasDocuments: !!(l.aadhar_image_path && l.pan_image_path),
    // Calculate match probability (simple: based on available funds vs loan amount)
    matchProbability: l.available_funds >= loan.loanAmount * 1.5 ? 'high' : 
                      l.available_funds >= loan.loanAmount * 1.2 ? 'medium' : 'low',
  }));

  return { items, nextCursor, loanAmount: loan.loanAmount };
}

/**
 * Get matching loan applications for a lender
 * Returns loans that the lender can fully fund
 * 
 * @param {Object} params
 * @param {number} params.lenderId - The lender profile ID
 * @param {number} [params.take=10] - Page size
 * @param {number} [params.cursorId] - Loan application ID to cursor from
 * @param {number} [params.minCreditScore] - Optional minimum credit score filter
 * @param {number} [params.maxTenureMonths] - Optional max tenure filter
 * @param {number} [params.minTenureMonths] - Optional min tenure filter
 * @returns {Promise<{items: Array, nextCursor: number|null}>}
 */
export async function getMatchingLoansForLender(params) {
  try {
    const { lenderId, take = 10, cursorId, minCreditScore, maxTenureMonths, minTenureMonths } = params;

    console.log('🔍 getMatchingLoansForLender called with:', params);

    if (!lenderId) {
      throw new Error('Lender ID is required');
    }

    // 1. Fetch the lender profile
    const lender = await prisma.lenderProfile.findUnique({
      where: { id: Number(lenderId) },
      select: {
        id: true,
        available_funds: true,
        kyc_status: true,
        interest_rate: true,
        userId: true,
      },
    });

    if (!lender) {
      throw new Error('Lender profile not found');
    }

    console.log('✅ Lender found:', {
      id: lender.id,
      available_funds: lender.available_funds,
      kyc_status: lender.kyc_status,
    });

    if (!lender.available_funds || lender.kyc_status !== 'approved') {
      console.log('⚠️ Lender not eligible:', {
        hasFunds: !!lender.available_funds,
        kyc_status: lender.kyc_status,
      });
      return { items: [], nextCursor: null, availableFunds: lender.available_funds || 0 };
    }

    // 2. Build where clause for matching loans
    const whereClause = {
      loanAmount: { lte: lender.available_funds }, // Lender can fully fund
      status: 'PENDING',
    };

    // Optional filters - only add if they are valid numbers
    // Note: We'll filter creditScore after fetching since it might be on LoanApplication or BorrowerProfile
    // and we want to include loans where creditScore is null (will be filtered out later if needed)

    if (typeof maxTenureMonths === 'number' || typeof minTenureMonths === 'number') {
      whereClause.loanTenureMonths = {};
      if (typeof minTenureMonths === 'number' && !isNaN(minTenureMonths)) {
        whereClause.loanTenureMonths.gte = minTenureMonths;
      }
      if (typeof maxTenureMonths === 'number' && !isNaN(maxTenureMonths)) {
        whereClause.loanTenureMonths.lte = maxTenureMonths;
      }
    }

    console.log('🔍 Where clause:', JSON.stringify(whereClause, null, 2));

    // 3. Build query args with cursor pagination
    const queryArgs = {
      where: whereClause,
      orderBy: { id: 'asc' },
      take,
      include: {
        borrower: {
          select: {
            id: true,
            full_name: true,
            creditScore: true,
            monthly_income: true,
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
    };

    if (cursorId) {
      queryArgs.cursor = { id: cursorId };
      queryArgs.skip = 1;
    }

    console.log('🔍 Query args:', JSON.stringify(queryArgs, null, 2));

    console.log('📡 Executing Prisma query...');
    const loans = await prisma.loanApplication.findMany(queryArgs);
    console.log('✅ Found loans:', loans.length);

    const nextCursor = loans.length === take ? loans[loans.length - 1].id : null;

    // 4. Map and mask sensitive info
    let items = loans.map((l) => {
      try {
        return {
          id: l.id,
          borrowerId: l.borrowerId,
          borrowerName: l.borrower?.full_name || l.borrower?.user?.name || 'Anonymous',
          loanAmount: l.loanAmount,
          loanTenureMonths: l.loanTenureMonths,
          creditScore: l.creditScore || l.borrower?.creditScore || null,
          loanPurpose: l.loanPurpose,
          monthlyIncome: l.borrower?.monthly_income || null,
          createdAt: l.createdAt,
          // Calculate match score (simple: based on loan amount vs available funds)
          matchScore: lender.available_funds >= l.loanAmount * 1.5 ? 'high' :
                      lender.available_funds >= l.loanAmount * 1.2 ? 'medium' : 'low',
        };
      } catch (mapError) {
        console.error('❌ Error mapping loan:', l.id, mapError);
        return null;
      }
    }).filter(item => item !== null);

    // Apply credit score filter if needed (since it might be on borrower profile)
    if (typeof minCreditScore === 'number' && !isNaN(minCreditScore)) {
      items = items.filter(item => {
        const score = item.creditScore;
        return score !== null && score >= minCreditScore;
      });
    }

    console.log('✅ Returning items:', items.length);

    return { items, nextCursor, availableFunds: lender.available_funds };
  } catch (error) {
    console.error('❌ Error in getMatchingLoansForLender:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}
