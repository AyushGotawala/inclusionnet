import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMatchingLoans } from '../../store/slices/loanSlice';
import { createLoanOfferRequest, clearSubmitSuccess, clearError } from '../../store/slices/loanRequestSlice';
import { FileText, Calendar, TrendingUp, User, Loader, AlertCircle, Filter, Send } from 'lucide-react';

const MatchingLoans = () => {
  const dispatch = useDispatch();
  const { matchingLoans, matchingLoansNextCursor, isLoadingMatchingLoans, error } = useSelector((state) => state.loan);
  const { isLoading: isSubmittingRequest, submitSuccess, error: requestError } = useSelector((state) => state.loanRequest);
  const [filters, setFilters] = useState({
    minCreditScore: '',
    minTenureMonths: '',
    maxTenureMonths: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [requestingLoanId, setRequestingLoanId] = useState(null);

  useEffect(() => {
    dispatch(getMatchingLoans({}));
  }, [dispatch]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    dispatch(getMatchingLoans({
      minCreditScore: filters.minCreditScore ? Number(filters.minCreditScore) : undefined,
      minTenureMonths: filters.minTenureMonths ? Number(filters.minTenureMonths) : undefined,
      maxTenureMonths: filters.maxTenureMonths ? Number(filters.maxTenureMonths) : undefined,
    }));
  };

  const handleLoadMore = () => {
    if (matchingLoansNextCursor) {
      dispatch(getMatchingLoans({
        cursorId: matchingLoansNextCursor,
        minCreditScore: filters.minCreditScore ? Number(filters.minCreditScore) : undefined,
        minTenureMonths: filters.minTenureMonths ? Number(filters.minTenureMonths) : undefined,
        maxTenureMonths: filters.maxTenureMonths ? Number(filters.maxTenureMonths) : undefined,
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMatchBadge = (score) => {
    const config = {
      high: { text: 'High Match', color: 'bg-green-100 text-green-800 border-green-200' },
      medium: { text: 'Medium Match', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      low: { text: 'Low Match', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    const match = config[score] || config.low;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${match.color}`}>
        {match.text}
      </span>
    );
  };

  const handleOfferLoanRequest = async (loanApplicationId) => {
    try {
      setRequestingLoanId(loanApplicationId);
      dispatch(clearError());
      dispatch(clearSubmitSuccess());
      
      await dispatch(createLoanOfferRequest({
        loanApplicationId: Number(loanApplicationId),
        message: `I would like to offer funding for this loan application`
      })).unwrap();

      alert('Loan offer request sent successfully! The borrower will be notified.');
    } catch (error) {
      alert(error || 'Failed to send loan offer request');
    } finally {
      setRequestingLoanId(null);
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

  if (isLoadingMatchingLoans && matchingLoans.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="card">
        <div className="card-body">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Credit Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="900"
                  value={filters.minCreditScore}
                  onChange={(e) => handleFilterChange('minCreditScore', e.target.value)}
                  placeholder="e.g., 600"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Tenure (months)
                </label>
                <input
                  type="number"
                  min="1"
                  value={filters.minTenureMonths}
                  onChange={(e) => handleFilterChange('minTenureMonths', e.target.value)}
                  placeholder="e.g., 6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tenure (months)
                </label>
                <input
                  type="number"
                  min="1"
                  value={filters.maxTenureMonths}
                  onChange={(e) => handleFilterChange('maxTenureMonths', e.target.value)}
                  placeholder="e.g., 24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  onClick={handleApplyFilters}
                  disabled={isLoadingMatchingLoans}
                  className="btn btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {matchingLoans.length > 0 ? (
        <>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {matchingLoans.length} Matching Loan{matchingLoans.length !== 1 ? 's' : ''} Found
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                These are loan applications you can fully fund
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingLoans.map((loan) => (
              <div key={loan.id} className="card hover-lift">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Loan #{loan.id}</h4>
                      {getMatchBadge(loan.matchScore)}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-500">₹</span>
                        <span className="text-sm text-gray-600">Loan Amount</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(loan.loanAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Tenure</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {loan.loanTenureMonths} months
                      </span>
                    </div>

                    {loan.creditScore && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Credit Score</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {loan.creditScore}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Borrower:</span>
                      <span className="font-medium text-gray-900">{loan.borrowerName}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                    <p className="text-xs font-medium text-blue-700 uppercase mb-1">Purpose</p>
                    <p className="text-sm text-blue-900">{loan.loanPurpose}</p>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Applied on {formatDate(loan.createdAt)}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleOfferLoanRequest(loan.id)}
                      disabled={isSubmittingRequest && requestingLoanId === loan.id}
                      className="btn btn-primary w-full mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingRequest && requestingLoanId === loan.id ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Offer Loan Request
                        </>
                      )}
                    </button>
                    <Link
                      to={`/borrowers/${loan.borrowerId}/profile`}
                      className="btn btn-outline w-full text-center"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {matchingLoansNextCursor && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMatchingLoans}
                className="btn btn-outline"
              >
                {isLoadingMatchingLoans ? 'Loading...' : 'Load More Loans'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matching Loans Found</h3>
              <p className="text-gray-600">
                There are no loan applications that match your available funds at this time.
                Check back later for new opportunities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingLoans;
