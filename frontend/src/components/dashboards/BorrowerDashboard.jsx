import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../Layout';
import { CreditCard, Upload, FileText, AlertCircle, CheckCircle, Clock, User, X, MessageSquare } from 'lucide-react';
import { getBorrowerKYCStatus } from '../../store/slices/kycSlice';
import { getUnreadCount, getActiveChats, removeNotification } from '../../store/slices/chatSlice';

const BorrowerDashboard = () => {
  const dispatch = useDispatch();
  const { borrowerKycStatus, isLoading } = useSelector((state) => state.kyc);
  const { notifications = [] } = useSelector((state) => state.chat || {});
  const [showNotifications, setShowNotifications] = useState(true);
  
  // Get KYC status from Redux store or default to not_submitted
  const kycStatus = borrowerKycStatus?.kyc_status || 'not_submitted';

  useEffect(() => {
    dispatch(getBorrowerKYCStatus());
    dispatch(getUnreadCount());
    dispatch(getActiveChats());
  }, [dispatch]);

  // Note: Message notifications are handled in Layout.jsx to avoid duplicates
  
  const getKycStatusDisplay = () => {
    switch (kycStatus) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          text: 'KYC Under Review',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          action: 'Your KYC documents are being reviewed. You will be notified once approved.'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'KYC Approved',
          color: 'bg-green-50 border-green-200 text-green-800',
          action: 'Your account is verified. You can now apply for loans.'
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          text: 'KYC Rejected',
          color: 'bg-red-50 border-red-200 text-red-800',
          action: 'Please resubmit your KYC documents with correct information.'
        };
      default:
        return {
          icon: <Upload className="h-5 w-5 text-blue-500" />,
          text: 'Complete KYC',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          action: 'Upload your documents to verify your identity and start borrowing.'
        };
    }
  };

  const kycDisplay = getKycStatusDisplay();

  // Filter recent notifications (last 5)
  const recentNotifications = (notifications || []).slice(0, 5);

  return (
    <Layout title="Borrower Dashboard">
      {/* Message Notifications */}
      {showNotifications && Array.isArray(recentNotifications) && recentNotifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          {recentNotifications.map((notification) => {
            if (!notification || !notification.id) return null;
            return (
            <div
              key={notification.id}
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slideInRight"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                    <Link
                      to={`/messages/${notification.loanRequestId}`}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      View message →
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => {
                    dispatch(removeNotification(notification.id));
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            );
          })}
          {Array.isArray(notifications) && notifications.length > 5 && (
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition-colors"
            >
              Dismiss all
            </button>
          )}
        </div>
      )}
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white border-0 shadow-xl">
          <div className="card-body">
            <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-primary-100 text-lg">
            Ready to find the perfect loan for your needs? Start by completing your verification process.
          </p>
          </div>
        </div>

        {/* KYC Status Card */}
        <div className="card border-l-4 border-primary-500">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
              KYC Verification Status
            </h3>
              <div className={`badge ${kycDisplay.color.replace('bg-', 'badge-').replace('text-', '').split(' ')[0]}`}>
              {kycDisplay.icon}
              <span className="ml-2">{kycDisplay.text}</span>
              </div>
            </div>
          </div>
          <div className="card-body">
            <p className="text-gray-700 text-lg mb-6">{kycDisplay.action}</p>
            
            {kycStatus === 'not_submitted' && (
              <div className="alert alert-info rounded-xl p-6">
                <div className="flex items-start">
                  <Upload className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Complete Your KYC Verification</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      To start borrowing, you need to complete your KYC verification. This process helps us verify your identity and assess your creditworthiness.
                    </p>
                    <ul className="text-xs text-blue-600 mt-2 space-y-1">
                      <li>• Upload Aadhaar and PAN documents</li>
                      <li>• Provide employment and income details</li>
                      <li>• Financial assessment questionnaire</li>
                    </ul>
                    <div className="mt-4">
                      <Link
                        to="/borrower-kyc"
                        className="btn btn-primary inline-flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Start KYC Process
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {kycStatus === 'rejected' && (
              <div className="alert alert-danger rounded-xl p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">KYC Documents Rejected</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Your KYC documents were rejected. Please review the feedback and resubmit with corrected information.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to="/borrower-kyc"
                        className="btn btn-danger inline-flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Resubmit KYC
                      </Link>
                      <button className="btn btn-outline border-danger-600 text-danger-600 hover:bg-danger-50">
                        View Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {kycStatus === 'pending' && (
              <div className="alert alert-warning rounded-xl p-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">KYC Under Review</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your KYC documents are being reviewed by our team. This usually takes 24-48 hours. We'll notify you once the review is complete.
                    </p>
                    <div className="mt-2 text-xs text-yellow-600">
                      Submitted on: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {kycStatus === 'approved' && (
              <div className="alert alert-success rounded-xl p-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">KYC Verified Successfully</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Congratulations! Your identity has been verified. You can now apply for loans and access all borrower features.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to="/apply-loan"
                        className="btn btn-success inline-flex items-center"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Apply for Loan
                      </Link>
                      <button className="btn btn-outline border-success-600 text-success-600 hover:bg-success-50">
                        View Loan Options
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Apply for Loan */}
          <div className="card hover-lift">
            <div className="card-body">
            <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary-600" />
              </div>
                <h3 className="text-lg font-bold text-gray-900">Apply for Loan</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Get instant access to competitive loan offers from verified lenders.
            </p>
            {kycStatus === 'approved' ? (
              <Link
                to="/apply-loan"
                className="btn btn-primary w-full text-center"
              >
                Apply Now
              </Link>
            ) : (
              <button
                disabled
                className="btn w-full bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                Complete KYC First
              </button>
            )}
            </div>
          </div>

          {/* My Loans */}
          <div className="card hover-lift">
            <div className="card-body">
            <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-success-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-success-600" />
              </div>
                <h3 className="text-lg font-bold text-gray-900">My Loans</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Track your active loans, payment schedules, and loan history.
            </p>
            {kycStatus === 'approved' ? (
              <Link
                to="/my-loans"
                className="btn btn-success w-full text-center"
              >
                View Loans
              </Link>
            ) : (
              <button
                disabled
                className="btn w-full bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                No Active Loans
              </button>
            )}
            </div>
          </div>

          {/* Payment History */}
          <div className="card hover-lift">
            <div className="card-body">
            <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-accent-600" />
              </div>
                <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Review your payment history and build your credit profile.
            </p>
            <button
              disabled={kycStatus !== 'approved'}
                className={`btn w-full ${kycStatus === 'approved' ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white hover:from-accent-700 hover:to-accent-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {kycStatus === 'approved' ? 'View History' : 'No Payment History'}
            </button>
            </div>
          </div>

          {/* Profile Management */}
          <div className="card hover-lift">
            <div className="card-body">
            <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
              </div>
                <h3 className="text-lg font-bold text-gray-900">Manage Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Update your personal and financial information.
            </p>
            <Link
              to="/borrower-profile"
                className="btn btn-primary w-full text-center"
            >
              Edit Profile
            </Link>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-gray-900">Your Profile Summary</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Loans', value: '0', color: 'primary' },
                { label: 'Total Borrowed', value: '₹0', color: 'success' },
                { label: 'Credit Score', value: '-', color: 'accent' },
                { label: 'Default Rate', value: '0%', color: 'warning' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                  <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
              ))}
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        {kycStatus !== 'approved' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-900">Getting Started</h3>
            </div>
            <div className="card-body">
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Complete KYC Verification', desc: 'Upload your documents to verify your identity', completed: kycStatus !== 'not_submitted' },
                  { step: 2, title: 'Browse Loan Options', desc: 'Explore different loan types and rates', completed: kycStatus === 'approved' },
                  { step: 3, title: 'Submit Loan Application', desc: 'Apply for loans that match your needs', completed: false },
                  { step: 4, title: 'Connect with Lenders', desc: 'Get matched with suitable lenders', completed: false }
                ].map((item) => (
                  <div key={item.step} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      item.completed 
                        ? 'bg-gradient-to-br from-success-500 to-success-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                      {item.completed ? <CheckCircle className="h-6 w-6" /> : item.step}
                  </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BorrowerDashboard;