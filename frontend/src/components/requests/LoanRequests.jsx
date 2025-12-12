import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getBorrowerLoanRequests, getLenderLoanRequests, acceptLoanRequest, rejectLoanRequest } from '../../store/slices/loanRequestSlice';
import Layout from '../Layout';
import { CheckCircle, X, MessageSquare, Clock, AlertCircle, Loader, ArrowLeft, User, TrendingUp, CreditCard, FileText, DollarSign, Calendar, Info, Bell } from 'lucide-react';

const LoanRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { borrowerRequests, lenderRequests, isLoading, error } = useSelector((state) => state.loanRequest);

  const requests = (user?.role === 'BORROWER' ? borrowerRequests : lenderRequests) || [];

  useEffect(() => {
    if (!user) {
      console.log('LoanRequests: User not loaded yet');
      return;
    }
    
    console.log('LoanRequests: Fetching requests for role:', user.role);
    if (user.role === 'BORROWER') {
      dispatch(getBorrowerLoanRequests());
    } else if (user.role === 'LENDER') {
      dispatch(getLenderLoanRequests());
    }
  }, [dispatch, user]);

  const handleAccept = async (requestId) => {
    if (window.confirm('Are you sure you want to accept this request? You will be able to start chatting after acceptance.')) {
      try {
        await dispatch(acceptLoanRequest(requestId)).unwrap();
        alert('Request accepted! You can now start chatting.');
      } catch (error) {
        alert(error || 'Failed to accept request');
      }
    }
  };

  const handleReject = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await dispatch(rejectLoanRequest(requestId)).unwrap();
        alert('Request rejected');
      } catch (error) {
        alert(error || 'Failed to reject request');
      }
    }
  };

  const handleChat = (requestId) => {
    navigate(`/messages/${requestId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      ACCEPTED: { text: 'Accepted', color: 'bg-green-100 text-green-800 border-green-200' },
      REJECTED: { text: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
      CANCELLED: { text: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    const statusConfig = config[status] || config.PENDING;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
    );
  };

  const getOtherUser = (request) => {
    if (user?.role === 'BORROWER') {
      return request.lender;
    }
    return request.borrower;
  };

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    return `http://localhost:4000${profilePicture}`;
  };

  // Filter requests by status
  const pendingRequests = requests.filter(req => req.status === 'PENDING');
  const acceptedRequests = requests.filter(req => req.status === 'ACCEPTED');
  const otherRequests = requests.filter(req => !['PENDING', 'ACCEPTED'].includes(req.status));
  
  // Determine if user can take action (both borrower and lender can accept/reject any pending request involving them)
  const canTakeAction = (request) => {
    return request.status === 'PENDING';
  };

  // Don't render if user is not loaded
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to={user?.role === 'BORROWER' ? '/borrower-dashboard' : '/lender-dashboard'}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Notifications & Requests
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'BORROWER' 
                ? 'View and manage loan requests from lenders' 
                : 'View and manage loan requests from borrowers'}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card border-red-200 bg-red-50">
            <div className="card-body">
              <div className="flex items-center text-red-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>Error loading requests: {error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && requests.length === 0 && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            </div>
          </div>
        )}

        {/* Pending Requests Section (Can Accept/Reject) */}
        {!isLoading && pendingRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-yellow-600" />
              Pending Requests - Action Required ({pendingRequests.length})
            </h2>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {pendingRequests.map((request) => {
                const otherUser = getOtherUser(request);
                const unreadCount = request._count?.messages || 0;

                return (
                  <div key={request.id} className="card hover-lift border-l-4 border-yellow-500">
                    <div className="card-body">
                      {/* Header with User Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {getProfilePictureUrl(otherUser?.profilePicture) ? (
                            <img
                              src={getProfilePictureUrl(otherUser.profilePicture)}
                              alt={otherUser?.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-primary-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {user?.role === 'BORROWER' 
                                ? `Loan Offer from ${otherUser?.name || 'Lender'}` 
                                : `Funding Request from ${otherUser?.name || 'Borrower'}`}
                            </h3>
                            <p className="text-sm text-gray-600">{otherUser?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.status)}
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Loan Application Details (for Lender) */}
                      {user?.role === 'LENDER' && request.loanApplication && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                          <div className="flex items-center mb-3">
                            <FileText className="h-5 w-5 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-blue-900">Loan Application Details</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-blue-700 mb-1">Loan Amount</p>
                              <p className="font-bold text-blue-900 text-lg">
                                {formatCurrency(request.loanApplication.loanAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-700 mb-1">Tenure</p>
                              <p className="font-bold text-blue-900">
                                {request.loanApplication.loanTenureMonths} months
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-700 mb-1">Purpose</p>
                              <p className="font-semibold text-blue-900 text-sm">
                                {request.loanApplication.loanPurpose}
                              </p>
                            </div>
                            {request.borrower?.borrowerProfile?.creditScore && (
                              <div>
                                <p className="text-xs text-blue-700 mb-1">Credit Score</p>
                                <p className="font-bold text-blue-900">
                                  {request.borrower.borrowerProfile.creditScore}
                                </p>
                              </div>
                            )}
                          </div>
                          {request.borrower?.borrowerProfile?.monthly_income && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <p className="text-xs text-blue-700 mb-1">Borrower Monthly Income</p>
                              <p className="font-semibold text-blue-900">
                                {formatCurrency(request.borrower.borrowerProfile.monthly_income)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Lender Details (for Borrower) */}
                      {user?.role === 'BORROWER' && request.lender && (
                        <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                          <div className="flex items-center mb-3">
                            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="font-semibold text-green-900">Lender Information</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {request.lender?.lenderProfile?.available_funds && (
                              <div>
                                <p className="text-xs text-green-700 mb-1 flex items-center">
                                  <span className="text-sm font-bold mr-1">₹</span>
                                  Available Funds
                                </p>
                                <p className="font-bold text-green-900 text-lg">
                                  {formatCurrency(request.lender.lenderProfile.available_funds)}
                                </p>
                              </div>
                            )}
                            {request.lender?.lenderProfile?.interest_rate && (
                              <div>
                                <p className="text-xs text-green-700 mb-1">Interest Rate</p>
                                <p className="font-bold text-green-900 text-lg">
                                  {request.lender.lenderProfile.interest_rate}%
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-green-700 mb-1">Lender Name</p>
                              <p className="font-semibold text-green-900">
                                {request.lender.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Request Message */}
                      {request.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                          <div className="flex items-start">
                            <Info className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Message from {otherUser?.name}</p>
                              <p className="text-sm text-gray-900">{request.message}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                          Requested on {new Date(request.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAccept(request.id)}
                            className="btn btn-success"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept Request
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="btn btn-danger"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Accepted Requests Section */}
        {!isLoading && acceptedRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Accepted Requests ({acceptedRequests.length})
            </h2>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {acceptedRequests.map((request) => {
                const otherUser = getOtherUser(request);
                const unreadCount = request._count?.messages || 0;

                return (
                  <div key={request.id} className="card hover-lift border-l-4 border-green-500">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {getProfilePictureUrl(otherUser?.profilePicture) ? (
                            <img
                              src={getProfilePictureUrl(otherUser.profilePicture)}
                              alt={otherUser?.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-primary-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {otherUser?.name || (user?.role === 'BORROWER' ? 'Lender' : 'Borrower')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Loan Amount: {formatCurrency(request.loanApplication?.loanAmount || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.status)}
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                          Accepted on {new Date(request.updatedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <button
                          onClick={() => handleChat(request.id)}
                          className="btn btn-primary"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Open Chat
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-white text-primary-600 text-xs font-bold rounded-full px-2 py-1">
                              {unreadCount} new
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Requests (Rejected/Cancelled) */}
        {!isLoading && otherRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Other Requests ({otherRequests.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {otherRequests.map((request) => {
                const otherUser = getOtherUser(request);
                return (
                  <div key={request.id} className="card border-l-4 border-gray-400 opacity-75">
                    <div className="card-body">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getProfilePictureUrl(otherUser?.profilePicture) ? (
                            <img
                              src={getProfilePictureUrl(otherUser.profilePicture)}
                              alt={otherUser?.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{otherUser?.name}</h3>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(request.loanApplication?.loanAmount || 0)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && requests.length === 0 && (
          <div className="card">
            <div className="card-body">
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
                <p className="text-gray-600 mb-4">
                  {user?.role === 'BORROWER' 
                    ? 'You don\'t have any loan requests from lenders yet.' 
                    : 'You don\'t have any loan requests from borrowers yet.'}
                </p>
                {user?.role === 'BORROWER' ? (
                  <Link to="/my-loans" className="btn btn-primary">
                    View My Loans
                  </Link>
                ) : (
                  <Link to="/browse-matching-loans" className="btn btn-primary">
                    Browse Matching Loans
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoanRequests;
