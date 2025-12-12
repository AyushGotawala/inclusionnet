import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../Layout';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Users
} from 'lucide-react';
import { getMyLoanApplications } from '../../store/slices/loanSlice';

const MyLoans = () => {
  const dispatch = useDispatch();
  const { myApplications, isLoading, error } = useSelector((state) => state.loan);

  useEffect(() => {
    dispatch(getMyLoanApplications());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        icon: <Clock className="h-4 w-4" />,
        text: 'Pending Review',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        bgColor: 'bg-yellow-50',
      },
      UNDER_REVIEW: {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Under Review',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        bgColor: 'bg-blue-50',
      },
      APPROVED: {
        icon: <CheckCircle className="h-4 w-4" />,
        text: 'Approved',
        color: 'bg-green-100 text-green-800 border-green-200',
        bgColor: 'bg-green-50',
      },
      REJECTED: {
        icon: <XCircle className="h-4 w-4" />,
        text: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-200',
        bgColor: 'bg-red-50',
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Layout title="My Loans">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your loan applications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="My Loans">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Applications</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => dispatch(getMyLoanApplications())}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Loans">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/borrower-dashboard"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Loan Applications</h1>
            <p className="text-gray-600 mt-2">
              Track and manage all your loan applications in one place
            </p>
          </div>
          <Link
            to="/apply-loan"
            className="btn btn-primary inline-flex items-center"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Apply for New Loan
          </Link>
        </div>

        {/* Statistics Cards */}
        {myApplications && myApplications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-700">Total Applications</p>
                    <p className="text-2xl font-bold text-primary-900 mt-1">
                      {myApplications.length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">
                      {myApplications.filter(app => app.status === 'PENDING' || app.status === 'UNDER_REVIEW').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Approved</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {myApplications.filter(app => app.status === 'APPROVED').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {formatCurrency(myApplications.reduce((sum, app) => sum + app.loanAmount, 0))}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">₹</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loan Applications List */}
        {myApplications && myApplications.length > 0 ? (
          <div className="space-y-4">
            {myApplications.map((application) => (
              <div
                key={application.id}
                className="card hover-lift transition-all duration-200"
              >
                <div className="card-body">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left Section - Application Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              Application #{application.id}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            Applied on {formatDate(application.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Loan Amount */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary-600">₹</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Loan Amount</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              {formatCurrency(application.loanAmount)}
                            </p>
                          </div>
                        </div>

                        {/* Tenure */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-accent-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Tenure</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              {application.loanTenureMonths} months
                            </p>
                          </div>
                        </div>

                        {/* Credit Score */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-success-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Credit Score</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              {application.creditScore ? application.creditScore : 'Not calculated'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Loan Purpose */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 uppercase mb-1">Loan Purpose</p>
                        <p className="text-sm text-blue-900">{application.loanPurpose}</p>
                      </div>

                      {/* Admin Remarks (if available) */}
                      {application.adminRemarks && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <p className="text-xs font-medium text-yellow-700 uppercase mb-1">Admin Remarks</p>
                          <p className="text-sm text-yellow-900">{application.adminRemarks}</p>
                        </div>
                      )}

                      {/* View Matching Lenders Button (for PENDING loans) */}
                      {application.status === 'PENDING' && (
                        <div className="mt-4">
                          <Link
                            to={`/my-loans/${application.id}/matching-lenders`}
                            className="btn btn-primary w-full inline-flex items-center justify-center"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            View Matching Lenders
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Loan Applications Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  You haven't submitted any loan applications yet. Start by applying for a loan to get matched with lenders.
                </p>
                <Link
                  to="/apply-loan"
                  className="btn btn-primary inline-flex items-center"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Apply for Your First Loan
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyLoans;

