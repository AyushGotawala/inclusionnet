import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMatchingLenders, clearMatchingLenders, getMyLoanApplications } from '../../store/slices/loanSlice';
import { createLoanRequest, clearSubmitSuccess, clearError } from '../../store/slices/loanRequestSlice';
import Layout from '../Layout';
import { Users, TrendingUp, CheckCircle, AlertCircle, Loader, ArrowLeft, Send } from 'lucide-react';

const ViewMatchingLenders = () => {
  const { loanApplicationId } = useParams();
  const dispatch = useDispatch();
  const { matchingLenders, matchingLendersNextCursor, isLoadingMatchingLenders, error, myApplications, isLoading } = useSelector((state) => state.loan);
  const { isLoading: isSubmittingRequest, submitSuccess, error: requestError } = useSelector((state) => state.loanRequest);
  const [maxInterestRate, setMaxInterestRate] = useState('');
  const [requestingLenderId, setRequestingLenderId] = useState(null);

  // Fetch loan applications if not already loaded
  useEffect(() => {
    if (!myApplications || myApplications.length === 0) {
      dispatch(getMyLoanApplications());
    }
  }, [dispatch, myApplications]);

  // Find the loan application details
  const loanApplication = myApplications?.find(app => app.id === Number(loanApplicationId));

  // Initial fetch when component mounts or loanApplicationId changes
  useEffect(() => {
    if (loanApplicationId && !maxInterestRate) {
      console.log('🔄 Fetching matching lenders for loan:', loanApplicationId);
      dispatch(clearMatchingLenders()); // Clear previous results
      dispatch(getMatchingLenders({ loanApplicationId }))
        .unwrap()
        .then((data) => {
          console.log('✅ Matching lenders fetched successfully:', data);
        })
        .catch((error) => {
          console.error('❌ Error fetching matching lenders:', error);
        });
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearMatchingLenders());
    };
  }, [dispatch, loanApplicationId]); // Only run when loanApplicationId changes, not maxInterestRate

  const handleLoadMore = () => {
    if (matchingLendersNextCursor) {
      dispatch(getMatchingLenders({ 
        loanApplicationId: Number(loanApplicationId), 
        cursorId: matchingLendersNextCursor,
        maxInterestRate: maxInterestRate ? Number(maxInterestRate) : undefined,
      }));
    }
  };

  // Auto-filter when interest rate changes (with debounce)
  useEffect(() => {
    if (loanApplicationId) {
      const timer = setTimeout(() => {
        dispatch(clearMatchingLenders());
        dispatch(getMatchingLenders({ 
          loanApplicationId: Number(loanApplicationId),
          maxInterestRate: maxInterestRate ? Number(maxInterestRate) : undefined,
        }));
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    }
  }, [dispatch, loanApplicationId, maxInterestRate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMatchBadge = (probability) => {
    const config = {
      high: { text: 'High Match', color: 'bg-green-100 text-green-800 border-green-200' },
      medium: { text: 'Medium Match', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      low: { text: 'Low Match', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    const match = config[probability] || config.low;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${match.color}`}>
        {match.text}
      </span>
    );
  };

  const handleRequestFunding = async (lenderId) => {
    try {
      setRequestingLenderId(lenderId);
      dispatch(clearError());
      dispatch(clearSubmitSuccess());
      
      await dispatch(createLoanRequest({
        loanApplicationId: Number(loanApplicationId),
        lenderId,
        message: `I would like to request funding for my loan application of ${formatCurrency(loanApplication.loanAmount)}`
      })).unwrap();

      alert('Funding request sent successfully! The lender will be notified.');
    } catch (error) {
      alert(error || 'Failed to send funding request');
    } finally {
      setRequestingLenderId(null);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSubmitSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, dispatch]);

  if (!loanApplication) {
    return (
      <Layout title="Loan Not Found">
        <div className="card">
          <div className="card-body">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loan Application Not Found</h3>
              <p className="text-gray-600 mb-4">The loan application you're looking for doesn't exist.</p>
              <Link to="/my-loans" className="btn btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Loans
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loanApplication.status !== 'PENDING') {
    return (
      <Layout title="Loan Not Available">
        <div className="card">
          <div className="card-body">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loan Not Available for Matching</h3>
              <p className="text-gray-600 mb-4">
                Only PENDING loan applications can view matching lenders. Your loan status is: <strong>{loanApplication.status}</strong>
              </p>
              <Link to="/my-loans" className="btn btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Loans
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Matching Lenders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/my-loans"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Loans
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Matching Lenders</h1>
            <p className="text-gray-600 mt-2">
              Find lenders who can fund your loan application
            </p>
          </div>
        </div>

        {/* Loan Application Summary */}
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(loanApplication.loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tenure</p>
                <p className="text-xl font-bold text-gray-900">{loanApplication.loanTenureMonths} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Purpose</p>
                <p className="text-lg font-semibold text-gray-900">{loanApplication.loanPurpose}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Lenders</h3>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Interest Rate (%)
              </label>
              <input
                type="number"
                min="5"
                max="12"
                step="0.1"
                value={maxInterestRate}
                onChange={(e) => setMaxInterestRate(e.target.value)}
                placeholder="e.g., 10 (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {maxInterestRate 
                  ? `Showing lenders with interest rate ≤ ${maxInterestRate}%` 
                  : 'Enter a value between 5% and 12% to filter (optional)'}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingMatchingLenders && matchingLenders.length === 0 && (
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader className="h-12 w-12 animate-spin text-primary-600 mb-4" />
                <p className="text-lg text-gray-600">Loading matching lenders...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we find lenders for your loan</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoadingMatchingLenders && (
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">Error loading matching lenders</p>
                </div>
                <p className="text-sm text-red-600 ml-8">{error}</p>
                <button
                  onClick={() => dispatch(getMatchingLenders({ loanApplicationId: Number(loanApplicationId) }))}
                  className="btn btn-outline btn-sm w-fit ml-8"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoadingMatchingLenders && !error && matchingLenders.length > 0 && (
          <>
            <div className="card bg-green-50 border-green-200">
              <div className="card-body">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {matchingLenders.length} Matching Lender{matchingLenders.length !== 1 ? 's' : ''} Found
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  These lenders can fully fund your loan of {formatCurrency(loanApplication.loanAmount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingLenders.map((lender) => (
                <div key={lender.id} className="card hover-lift transition-all duration-200">
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{lender.lenderName}</h4>
                        {getMatchBadge(lender.matchProbability)}
                      </div>
                      {lender.hasDocuments && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" title="Documents Verified" />
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-500">₹</span>
                          <span className="text-sm text-gray-600">Available Funds</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(lender.available_funds)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Interest Rate</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {lender.interest_rate ? `${lender.interest_rate}%` : 'Not specified'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleRequestFunding(lender.id)}
                        disabled={isSubmittingRequest && requestingLenderId === lender.id}
                        className="btn btn-primary w-full mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingRequest && requestingLenderId === lender.id ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Request Funding
                          </>
                        )}
                      </button>
                      <button className="btn btn-outline w-full text-sm">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {matchingLendersNextCursor && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMatchingLenders}
                  className="btn btn-outline"
                >
                  {isLoadingMatchingLenders ? 'Loading...' : 'Load More Lenders'}
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!isLoadingMatchingLenders && !error && matchingLenders.length === 0 && (
          <div className="card">
            <div className="card-body">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matching Lenders Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any lenders who can fully fund your loan of {formatCurrency(loanApplication.loanAmount)} at this time.
                  <br />
                  <br />
                  Try adjusting your loan amount or check back later for new lenders.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/my-loans" className="btn btn-outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Loans
                  </Link>
                  <button
                    onClick={() => dispatch(getMatchingLenders({ loanApplicationId: Number(loanApplicationId) }))}
                    className="btn btn-primary"
                  >
                    Refresh Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewMatchingLenders;
