import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMatchingLenders } from '../../store/slices/loanSlice';
import { Users, TrendingUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const MatchingLenders = ({ loanApplicationId, loanAmount }) => {
  const dispatch = useDispatch();
  const { matchingLenders, matchingLendersNextCursor, isLoadingMatchingLenders, error } = useSelector((state) => state.loan);
  const [maxInterestRate, setMaxInterestRate] = useState('');

  useEffect(() => {
    if (loanApplicationId) {
      console.log('🔄 Fetching matching lenders for loan:', loanApplicationId);
      dispatch(getMatchingLenders({ loanApplicationId }))
        .unwrap()
        .then((data) => {
          console.log('✅ Matching lenders fetched successfully:', data);
        })
        .catch((error) => {
          console.error('❌ Error fetching matching lenders:', error);
        });
    } else {
      console.warn('⚠️ No loanApplicationId provided');
    }
  }, [dispatch, loanApplicationId]);

  const handleLoadMore = () => {
    if (matchingLendersNextCursor) {
      dispatch(getMatchingLenders({ 
        loanApplicationId, 
        cursorId: matchingLendersNextCursor,
        maxInterestRate: maxInterestRate ? Number(maxInterestRate) : undefined,
      }));
    }
  };

  const handleFilter = () => {
    dispatch(getMatchingLenders({ 
      loanApplicationId,
      maxInterestRate: maxInterestRate ? Number(maxInterestRate) : undefined,
    }));
  };

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

  if (isLoadingMatchingLenders && matchingLenders.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Loader className="h-8 w-8 animate-spin text-primary-600 mb-2" />
            <p className="text-sm text-gray-600">Loading matching lenders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error loading matching lenders</p>
            </div>
            <p className="text-sm text-red-600 ml-8">{error}</p>
            <button
              onClick={() => dispatch(getMatchingLenders({ loanApplicationId }))}
              className="btn btn-outline btn-sm w-fit ml-8"
            >
              Retry
            </button>
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
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
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
                placeholder="e.g., 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={handleFilter}
              disabled={isLoadingMatchingLenders}
              className="btn btn-primary px-6"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {matchingLenders.length > 0 ? (
        <>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {matchingLenders.length} Matching Lender{matchingLenders.length !== 1 ? 's' : ''} Found
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                These lenders can fully fund your loan of {formatCurrency(loanAmount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingLenders.map((lender) => (
              <div key={lender.id} className="card hover-lift">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{lender.lenderName}</h4>
                      {getMatchBadge(lender.matchProbability)}
                    </div>
                    {lender.hasDocuments && (
                      <CheckCircle className="h-5 w-5 text-green-500" title="Documents Verified" />
                    )}
                  </div>

                  <div className="space-y-3">
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

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="btn btn-primary w-full">
                      Request Funding
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
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matching Lenders Found</h3>
              <p className="text-gray-600">
                We couldn't find any lenders who can fully fund your loan at this time.
                Try adjusting your loan amount or check back later.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingLenders;
