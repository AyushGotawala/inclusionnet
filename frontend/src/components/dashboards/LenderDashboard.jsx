import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layout';
import { DollarSign, Upload, TrendingUp, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const LenderDashboard = () => {
  // This would come from API in real implementation
  const kycStatus = 'pending'; // 'pending', 'approved', 'rejected', 'not_submitted'
  
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
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to your lending dashboard!</h2>
          <p className="text-green-100">
            Start earning competitive returns by lending to verified borrowers in our secure marketplace.
          </p>
        </div>

        {/* KYC Status Card */}
        <div className={`border rounded-lg p-6 ${kycDisplay.color}`}>
          <div className="flex items-start space-x-3">
            {kycDisplay.icon}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{kycDisplay.text}</h3>
              <p className="mb-4">{kycDisplay.action}</p>
              {kycStatus === 'not_submitted' && (
                <Link
                  to="/lender-kyc"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Start KYC Verification
                </Link>
              )}
              {kycStatus === 'rejected' && (
                <Link
                  to="/lender-kyc"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Resubmit Documents
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Browse Borrowers */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Browse Borrowers</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Explore verified borrower profiles and find suitable investment opportunities.
            </p>
            <button
              disabled={kycStatus !== 'approved'}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition duration-200 ${
                kycStatus === 'approved'
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              {kycStatus === 'approved' ? 'Browse Now' : 'Complete KYC First'}
            </button>
          </div>

          {/* My Investments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">My Investments</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Track your active loans, expected returns, and investment portfolio.
            </p>
            <button
              disabled={kycStatus !== 'approved'}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition duration-200 ${
                kycStatus === 'approved'
                  ? 'text-white bg-green-600 hover:bg-green-700'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              {kycStatus === 'approved' ? 'View Portfolio' : 'No Investments'}
            </button>
          </div>

          {/* Returns & Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Returns & Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor your returns, analyze performance, and optimize your strategy.
            </p>
            <button
              disabled={kycStatus !== 'approved'}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition duration-200 ${
                kycStatus === 'approved'
                  ? 'text-white bg-purple-600 hover:bg-purple-700'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              {kycStatus === 'approved' ? 'View Analytics' : 'No Data Available'}
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Portfolio Summary</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">₹0</div>
                <div className="text-sm text-gray-500">Total Invested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹0</div>
                <div className="text-sm text-gray-500">Total Returns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-500">Active Loans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0%</div>
                <div className="text-sm text-gray-500">Avg. Return Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Opportunities */}
        {kycStatus === 'approved' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Featured Investment Opportunities</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No borrowers available at the moment</p>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-200">
                  Refresh Opportunities
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started Guide */}
        {kycStatus !== 'approved' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Getting Started as a Lender</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    kycStatus !== 'not_submitted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {kycStatus !== 'not_submitted' ? <CheckCircle className="h-5 w-5" /> : '1'}
                  </div>
                  <div>
                    <h4 className="font-medium">Complete KYC Verification</h4>
                    <p className="text-sm text-gray-500">Upload your documents to verify your identity</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    kycStatus === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {kycStatus === 'approved' ? <CheckCircle className="h-5 w-5" /> : '2'}
                  </div>
                  <div>
                    <h4 className="font-medium">Set Investment Preferences</h4>
                    <p className="text-sm text-gray-500">Define your risk tolerance and investment goals</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Browse Borrower Profiles</h4>
                    <p className="text-sm text-gray-500">Review verified borrowers and their loan requests</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Start Investing</h4>
                    <p className="text-sm text-gray-500">Fund loans and start earning competitive returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Investment Risk Disclosure</h4>
              <p className="text-sm text-blue-800">
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