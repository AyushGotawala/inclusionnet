import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../Layout';
import { DollarSign, Upload, TrendingUp, Users, CheckCircle, Clock, AlertCircle, FileText, User } from 'lucide-react';
import { getLenderKYCStatus } from '../../store/slices/kycSlice';

const LenderDashboard = () => {
  const dispatch = useDispatch();
  const { lenderKycStatus, isLoading } = useSelector((state) => state.kyc);
  
  // Get KYC status from Redux store or default to not_submitted
  const kycStatus = lenderKycStatus?.kyc_status || 'not_submitted';

  useEffect(() => {
    dispatch(getLenderKYCStatus());
  }, [dispatch]);
  
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
          action: 'Your account is verified. You can now start lending and earning returns.'
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
          action: 'Upload your documents to verify your identity and start lending.'
        };
    }
  };

  const kycDisplay = getKycStatusDisplay();

  return (
    <Layout title="Lender Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card bg-gradient-to-r from-success-600 via-success-700 to-primary-600 text-white border-0 shadow-xl">
          <div className="card-body">
            <h2 className="text-3xl font-bold mb-2">Welcome to your lending dashboard!</h2>
            <p className="text-success-100 text-lg">
              Start earning competitive returns by lending to verified borrowers in our secure marketplace.
            </p>
          </div>
        </div>

        {/* KYC Status Card */}
        <div className="card border-l-4 border-success-500">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-success-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-success-600" />
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
              <div className="alert alert-success rounded-xl p-6">
                <div className="flex items-start">
                  <Upload className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">Complete Your Lender Verification</h4>
                    <p className="text-sm text-green-700 mt-1">
                      To start investing in peer-to-peer lending, complete your KYC verification. This process helps us ensure secure and compliant lending operations.
                    </p>
                    <ul className="text-xs text-green-600 mt-2 space-y-1">
                      <li>• Upload Aadhaar and PAN documents</li>
                      <li>• Provide investment experience details</li>
                      <li>• Investment capacity assessment</li>
                      <li>• Risk tolerance evaluation</li>
                    </ul>
                    <div className="mt-4">
                      <Link
                        to="/lender-kyc"
                        className="btn btn-success inline-flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Start Lender KYC
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
                    <h4 className="text-sm font-medium text-red-800">Lender KYC Documents Rejected</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Your lender verification documents were rejected. Please review the feedback and resubmit with corrected information.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to="/lender-kyc"
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
                    <h4 className="text-sm font-medium text-yellow-800">Lender Verification Under Review</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your lender KYC documents are being reviewed by our compliance team. This process takes 24-48 hours for investment platform verification.
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
                    <h4 className="text-sm font-medium text-green-800">Lender Verification Complete</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Congratulations! You're now a verified lender. Start exploring borrower profiles and build your investment portfolio.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to="/browse-borrowers"
                        className="btn btn-success inline-flex items-center"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Browse Borrowers
                      </Link>
                      <button className="btn btn-outline border-success-600 text-success-600 hover:bg-success-50">
                        Investment Guidelines
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
          {/* Browse Borrowers */}
          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Browse Borrowers</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Explore verified borrower profiles and find suitable investment opportunities.
              </p>
              <button
                disabled={kycStatus !== 'approved'}
                className={`btn w-full ${kycStatus === 'approved' ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {kycStatus === 'approved' ? 'Browse Now' : 'Complete KYC First'}
              </button>
            </div>
          </div>

          {/* My Investments */}
          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-success-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-success-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">My Investments</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track your active loans, expected returns, and investment portfolio.
              </p>
              <button
                disabled={kycStatus !== 'approved'}
                className={`btn w-full ${kycStatus === 'approved' ? 'btn-success' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {kycStatus === 'approved' ? 'View Portfolio' : 'No Investments'}
              </button>
            </div>
          </div>

          {/* Returns & Analytics */}
          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Returns & Analytics</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Monitor your returns, analyze performance, and optimize your strategy.
              </p>
              <button
                disabled={kycStatus !== 'approved'}
                className={`btn w-full ${kycStatus === 'approved' ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white hover:from-accent-700 hover:to-accent-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {kycStatus === 'approved' ? 'View Analytics' : 'No Data Available'}
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
                Update your investment preferences and personal information.
              </p>
              <Link
                to="/lender-profile"
                className="btn btn-primary w-full text-center"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-gray-900">Portfolio Summary</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Invested', value: '₹0', color: 'primary' },
                { label: 'Total Returns', value: '₹0', color: 'success' },
                { label: 'Active Loans', value: '0', color: 'accent' },
                { label: 'Avg. Return Rate', value: '0%', color: 'warning' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                  <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Investment Opportunities */}
        {kycStatus === 'approved' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-900">Featured Investment Opportunities</h3>
            </div>
            <div className="card-body">
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-6 text-lg">No borrowers available at the moment</p>
                <button className="btn btn-secondary">
                  Refresh Opportunities
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started Guide */}
        {kycStatus !== 'approved' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-900">Getting Started as a Lender</h3>
            </div>
            <div className="card-body">
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Complete KYC Verification', desc: 'Upload your documents to verify your identity', completed: kycStatus !== 'not_submitted' },
                  { step: 2, title: 'Set Investment Preferences', desc: 'Define your risk tolerance and investment goals', completed: kycStatus === 'approved' },
                  { step: 3, title: 'Browse Borrower Profiles', desc: 'Review verified borrowers and their loan requests', completed: false },
                  { step: 4, title: 'Start Investing', desc: 'Fund loans and start earning competitive returns', completed: false }
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

        {/* Risk Information */}
        <div className="alert alert-info rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-primary-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-primary-900 mb-2">Investment Risk Disclosure</h4>
              <p className="text-sm text-primary-800 leading-relaxed">
                All investments carry risk. Past performance does not guarantee future results. 
                Please carefully review borrower profiles and only invest what you can afford to lose. 
                Diversify your investments to minimize risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LenderDashboard;