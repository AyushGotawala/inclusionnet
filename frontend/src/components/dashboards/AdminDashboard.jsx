import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../Layout';
import { getBorrowerKYCList, getLenderKYCList, verifyBorrowerKYC, verifyLenderKYC } from '@/store/slices/kycSlice';
import { Users, UserCheck, FileText, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';

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
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{kyc.full_name}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${
          type === 'borrower' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {type === 'borrower' ? 'Borrower' : 'Lender'}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p><span className="font-medium">Email:</span> {kyc.email}</p>
        <p><span className="font-medium">Phone:</span> {kyc.contact_number}</p>
        <p><span className="font-medium">Aadhaar:</span> {kyc.aadhaar_number}</p>
        <p><span className="font-medium">PAN:</span> {kyc.pan_number}</p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => openKycModal(kyc, type)}
          className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
        <button
          onClick={() => handleVerifyKyc(kyc.userId, 'approved', type)}
          className="flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm rounded transition-colors"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve
        </button>
        <button
          onClick={() => handleVerifyKyc(kyc.userId, 'rejected', type)}
          className="flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded transition-colors"
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </button>
      </div>
    </div>
  );

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Admin Control Center</h2>
          <p className="text-purple-100">
            Manage KYC verifications, monitor platform activity, and ensure compliance.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Borrower KYCs</p>
                <p className="text-2xl font-semibold text-gray-900">{borrowerKycList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Lender KYCs</p>
                <p className="text-2xl font-semibold text-gray-900">{lenderKycList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total KYCs</p>
                <p className="text-2xl font-semibold text-gray-900">{borrowerKycList.length + lenderKycList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Urgent Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('borrowers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'borrowers'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Borrower KYCs ({borrowerKycList.length})
              </button>
              <button
                onClick={() => setActiveTab('lenders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lenders'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lender KYCs ({lenderKycList.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
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
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC Detail Modal */}
      {showModal && selectedKyc && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedKyc.type === 'borrower' ? 'Borrower' : 'Lender'} KYC Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedKyc.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedKyc.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedKyc.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedKyc.contact_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedKyc.aadhaar_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedKyc.pan_number}</p>
                </div>
              </div>
              
              {selectedKyc.type === 'borrower' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKyc.employment_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                    <p className="mt-1 text-sm text-gray-900">₹{selectedKyc.monthly_income || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Previous Loans</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKyc.previous_loans ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}
              
              {selectedKyc.type === 'lender' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Investment Experience</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKyc.investment_experience || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Investment Amount</label>
                    <p className="mt-1 text-sm text-gray-900">₹{selectedKyc.investment_amount || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Uploaded Documents</h4>
                <div className="space-y-2">
                  {selectedKyc.aadhaar_image && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aadhaar Document</label>
                      <a 
                        href={selectedKyc.aadhaar_image} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 text-sm"
                      >
                        View Aadhaar Document
                      </a>
                    </div>
                  )}
                  {selectedKyc.pan_image && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PAN Document</label>
                      <a 
                        href={selectedKyc.pan_image} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 text-sm"
                      >
                        View PAN Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  handleVerifyKyc(selectedKyc.userId, 'rejected', selectedKyc.type);
                  closeModal();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleVerifyKyc(selectedKyc.userId, 'approved', selectedKyc.type);
                  closeModal();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;