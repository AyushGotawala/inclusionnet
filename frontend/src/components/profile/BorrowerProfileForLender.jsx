import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { 
  User, 
  Calendar, 
  TrendingUp, 
  Briefcase, 
  Mail, 
  Phone, 
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Loader,
  CreditCard
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const BorrowerProfileForLender = () => {
  const { borrowerId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBorrowerProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/api/loans/borrowers/${borrowerId}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load borrower profile');
        }
      } catch (err) {
        console.error('Error fetching borrower profile:', err);
        setError(err.response?.data?.message || 'Failed to load borrower profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (borrowerId) {
      fetchBorrowerProfile();
    }
  }, [borrowerId]);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        icon: <Clock className="h-4 w-4" />,
        text: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      APPROVED: {
        icon: <CheckCircle className="h-4 w-4" />,
        text: 'Approved',
        color: 'bg-green-100 text-green-800 border-green-200',
      },
      REJECTED: {
        icon: <XCircle className="h-4 w-4" />,
        text: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-200',
      },
      UNDER_REVIEW: {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Under Review',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Layout title="Borrower Profile">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading borrower profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="card">
          <div className="card-body">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link to="/browse-matching-loans" className="btn btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Matching Loans
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout title="Profile Not Found">
        <div className="card">
          <div className="card-body">
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
              <Link to="/browse-matching-loans" className="btn btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Matching Loans
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Borrower Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/browse-matching-loans"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Matching Loans
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Borrower Profile</h1>
            <p className="text-gray-600 mt-2">
              Complete borrower information and loan history
            </p>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="card-body">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile.full_name?.charAt(0)?.toUpperCase() || 'B'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.full_name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {profile.age && <span>Age: {profile.age} years</span>}
                  {profile.gender && <span>Gender: {profile.gender}</span>}
                  {profile.kyc_status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      profile.kyc_status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : profile.kyc_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      KYC: {profile.kyc_status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Loans</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {profile.loanStatistics?.totalLoans || 0}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Active Loans</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {profile.loanStatistics?.activeLoans || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending Loans</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    {profile.loanStatistics?.pendingLoans || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Amount</p>
                  <p className="text-lg font-bold text-purple-900 mt-1">
                    {formatCurrency(profile.loanStatistics?.totalLoanAmount || 0)}
                  </p>
                </div>
                <span className="text-2xl font-bold text-purple-600">₹</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{profile.full_name}</p>
                  </div>
                </div>
                {profile.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                )}
                {profile.contact_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Contact Number</p>
                      <p className="font-medium text-gray-900">{profile.contact_number}</p>
                    </div>
                  </div>
                )}
                {profile.age && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="font-medium text-gray-900">{profile.age} years</p>
                    </div>
                  </div>
                )}
                {profile.gender && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium text-gray-900">{profile.gender}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employment & Financial Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Employment & Financial</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {profile.employment_type && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Employment Type</p>
                      <p className="font-medium text-gray-900">{profile.employment_type}</p>
                    </div>
                  </div>
                )}
                {profile.monthly_income && (
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-gray-400">₹</span>
                    <div>
                      <p className="text-xs text-gray-500">Monthly Income</p>
                      <p className="font-medium text-gray-900">{formatCurrency(profile.monthly_income)}</p>
                    </div>
                  </div>
                )}
                {profile.years_of_job_stability !== null && profile.years_of_job_stability !== undefined && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Job Stability</p>
                      <p className="font-medium text-gray-900">{profile.years_of_job_stability} years</p>
                    </div>
                  </div>
                )}
                {profile.creditScore && (
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Credit Score</p>
                      <p className="font-medium text-gray-900">{profile.creditScore}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Loan Applications */}
        {profile.recentLoans && profile.recentLoans.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Recent Loan Applications</h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {profile.recentLoans.length} of {profile.loanStatistics?.totalLoans || 0} total loans
              </p>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {profile.recentLoans.map((loan) => (
                  <div key={loan.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Loan #{loan.id}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied on {formatDate(loan.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(loan.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(loan.loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tenure</p>
                        <p className="font-semibold text-gray-900">{loan.loanTenureMonths} months</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Purpose</p>
                        <p className="font-semibold text-gray-900">{loan.loanPurpose}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="card">
          <div className="card-body">
            <div className="flex gap-4">
              <button className="btn btn-primary flex-1">
                Offer Loan
              </button>
              <Link
                to="/browse-matching-loans"
                className="btn btn-outline flex-1 text-center"
              >
                Back to Matching Loans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BorrowerProfileForLender;
