import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../Layout';
import { getBorrowerKYCList, getLenderKYCList, verifyBorrowerKYC, verifyLenderKYC } from '@/store/slices/kycSlice';
import { Users, UserCheck, FileText, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import KYCReviewModal from './KYCReviewModal';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { borrowerKycList, lenderKycList, isLoading, error } = useSelector((state) => state.kyc);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getBorrowerKYCList());
    dispatch(getLenderKYCList());
  }, [dispatch]);

  const handleVerifyKyc = (userId, status, type) => {
    if (type === 'borrower') {
      dispatch(verifyBorrowerKYC({ userId, status }));
    } else {
      dispatch(verifyLenderKYC({ userId, status }));
    }
    setShowModal(false);
    setSelectedKyc(null);
  };

  const handleApprove = (userId) => {
    handleVerifyKyc(userId, 'approved', selectedKyc?.type);
  };

  const handleReject = (userId) => {
    handleVerifyKyc(userId, 'rejected', selectedKyc?.type);
  };

  const openKycModal = (kyc, type) => {
    setSelectedKyc({ ...kyc, type });
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedKyc(null);
    setShowModal(false);
  };

  const KycCard = ({ kyc, type }) => (
    <div className="card hover-lift">
      <div className="card-body">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{kyc.full_name}</h4>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            type === 'borrower' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {type === 'borrower' ? 'Borrower' : 'Lender'}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            kyc.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            kyc.kyc_status === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {kyc.kyc_status}
          </span>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p><span className="font-medium">Email:</span> {kyc.email}</p>
        <p><span className="font-medium">Phone:</span> {kyc.contact_number}</p>
        <p><span className="font-medium">Aadhaar:</span> {kyc.aadhaar_number}</p>
        <p><span className="font-medium">PAN:</span> {kyc.pan_number}</p>
      </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => openKycModal(kyc, type)}
            className="btn btn-secondary text-sm py-2"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </button>
          <button
            onClick={() => handleVerifyKyc(kyc.userId, 'approved', type)}
            className="btn btn-success text-sm py-2"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </button>
          <button
            onClick={() => handleVerifyKyc(kyc.userId, 'rejected', type)}
            className="btn btn-danger text-sm py-2"
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card bg-gradient-to-r from-accent-600 via-accent-700 to-primary-600 text-white border-0 shadow-xl">
          <div className="card-body">
            <h2 className="text-3xl font-bold mb-2">Admin Control Center</h2>
            <p className="text-accent-100 text-lg">
              Manage KYC verifications, monitor platform activity, and ensure compliance.
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Pending Borrower KYCs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{borrowerKycList.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-success-100 flex items-center justify-center">
                  <UserCheck className="h-7 w-7 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Pending Lender KYCs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{lenderKycList.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-accent-100 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Total KYCs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{borrowerKycList.length + lenderKycList.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-warning-100 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Urgent Reviews</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('borrowers')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'borrowers'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Borrower KYCs ({borrowerKycList.length})
              </button>
              <button
                onClick={() => setActiveTab('lenders')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'lenders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lender KYCs ({lenderKycList.length})
              </button>
            </nav>
          </div>

          <div className="card-body">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Borrower KYCs */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Borrower KYCs</h3>
                    <div className="space-y-3">
                      {borrowerKycList.slice(0, 3).map((kyc, index) => (
                        <KycCard key={index} kyc={kyc} type="borrower" />
                      ))}
                      {borrowerKycList.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No pending borrower KYCs</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Lender KYCs */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Lender KYCs</h3>
                    <div className="space-y-3">
                      {lenderKycList.slice(0, 3).map((kyc, index) => (
                        <KycCard key={index} kyc={kyc} type="lender" />
                      ))}
                      {lenderKycList.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No pending lender KYCs</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'borrowers' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Borrower KYC Verifications</h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading KYCs...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {borrowerKycList.map((kyc, index) => (
                      <KycCard key={index} kyc={kyc} type="borrower" />
                    ))}
                    {borrowerKycList.length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pending borrower KYCs</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'lenders' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lender KYC Verifications</h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading KYCs...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lenderKycList.map((kyc, index) => (
                      <KycCard key={index} kyc={kyc} type="lender" />
                    ))}
                    {lenderKycList.length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pending lender KYCs</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-danger-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC Review Modal */}
      {showModal && selectedKyc && (
        <KYCReviewModal
          kyc={selectedKyc}
          type={selectedKyc.type}
          onClose={closeModal}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={isLoading}
        />
      )}
    </Layout>
  );
};

export default AdminDashboard;