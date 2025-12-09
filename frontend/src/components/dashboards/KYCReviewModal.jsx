import React, { useState } from 'react';
import { X, Download, FileText, User, CreditCard, Briefcase, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const KYCReviewModal = ({ kyc, type, onClose, onApprove, onReject, isLoading }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentType, setDocumentType] = useState(null);

  const getDocumentUrl = (filename) => {
    if (!filename || filename === '' || filename === 'null' || filename === 'undefined') {
      console.log('Invalid filename:', filename);
      return null;
    }
    
    // If already a full URL, return as is
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Extract just the filename if it contains a path
    // Handle both forward and backward slashes
    let cleanFilename = filename;
    if (filename.includes('/')) {
      cleanFilename = filename.split('/').pop();
    }
    if (cleanFilename.includes('\\')) {
      cleanFilename = cleanFilename.split('\\').pop();
    }
    
    // Remove any leading/trailing whitespace
    cleanFilename = cleanFilename.trim();
    
    if (!cleanFilename) {
      console.log('Empty filename after cleaning:', filename);
      return null;
    }
    
    // Construct the URL - try API endpoint first, fallback to static
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    // Use API endpoint for better control and headers
    const url = `${baseUrl}/api/documents/kyc/${cleanFilename}`;
    console.log('Document URL constructed:', { original: filename, cleaned: cleanFilename, url });
    return url;
  };

  const isImageFile = (filename) => {
    if (!filename) return false;
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const isPdfFile = (filename) => {
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.pdf');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openDocument = async (filename, docType) => {
    const url = getDocumentUrl(filename);
    console.log('Opening document:', { filename, url, docType });
    
    if (!url) {
      console.error('Invalid document URL:', filename);
      alert('Document not available. Please check if the file was uploaded correctly.');
      return;
    }

    // Test if the URL is accessible before opening
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      if (!response.ok) {
        console.error('Document not accessible:', response.status, response.statusText);
        // Still allow opening - might be a CORS preflight issue
        console.warn('⚠️ HEAD request failed, but will try to open document anyway');
      } else {
        console.log('✅ Document is accessible');
      }
    } catch (error) {
      console.error('❌ Error checking document:', error);
      // Don't block - might be CORS preflight issue, but the actual GET might work
      console.warn('⚠️ Connection test failed, but will try to open document anyway');
    }

    setSelectedDocument(url);
    setDocumentType(docType);
  };

  const closeDocument = () => {
    setSelectedDocument(null);
    setDocumentType(null);
  };

  const renderDocumentViewer = () => {
    if (!selectedDocument) return null;

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={closeDocument}>
        <div className="max-w-6xl max-h-[95vh] w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-t-xl shadow-2xl flex-shrink-0">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {documentType} Document
              </h3>
              <button
                onClick={closeDocument}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="bg-gray-900 flex-1 overflow-auto rounded-b-xl p-4">
            {isPdfFile(selectedDocument) ? (
              <div className="w-full h-full flex flex-col">
                {/* Primary viewing method - Direct link */}
                <div className="flex-shrink-0 text-center bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-lg mb-4">
                  <p className="text-base text-white mb-4 font-semibold">
                    📄 {documentType} Document
                  </p>
                  <p className="text-sm text-blue-100 mb-4">
                    Click below to view the document in a new browser tab
                  </p>
                  <div className="flex gap-3 justify-center">
                    <a
                      href={selectedDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary inline-flex items-center text-sm bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 text-base font-semibold"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Open PDF in New Tab
                    </a>
                    <a
                      href={selectedDocument}
                      download
                      className="btn btn-secondary inline-flex items-center text-sm bg-blue-800 text-white hover:bg-blue-700 px-6 py-3 text-base font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </a>
                  </div>
                  <p className="text-xs text-blue-200 mt-3 break-all">{selectedDocument}</p>
                </div>
                {/* Alternative: Embedded viewer (may not work in all browsers) */}
                <div className="flex-1 bg-white rounded border-2 border-gray-300">
                  <div className="p-2 bg-gray-100 border-b">
                    <p className="text-xs text-gray-600 text-center">
                      Embedded Viewer (if your browser supports it):
                    </p>
                  </div>
                  <iframe
                    src={`${selectedDocument}#toolbar=1&navpanes=0`}
                    className="w-full h-full min-h-[500px] rounded-b"
                    title={`${documentType} Document`}
                    style={{ minHeight: '500px', border: 'none' }}
                    onLoad={() => {
                      console.log('✅ PDF iframe loaded successfully:', selectedDocument);
                    }}
                    onError={(e) => {
                      console.error('❌ Iframe load error:', e);
                    }}
                  />
                </div>
              </div>
            ) : isImageFile(selectedDocument) ? (
              <div className="flex items-center justify-center h-full">
                <img
                  src={selectedDocument}
                  alt={`${documentType} Document`}
                  className="max-w-full max-h-full object-contain rounded shadow-2xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden flex-col items-center justify-center text-white">
                  <AlertCircle className="w-16 h-16 mb-4 text-gray-400" />
                  <p className="text-lg">Document not available</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <FileText className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-lg">Unsupported file format</p>
                <a
                  href={selectedDocument}
                  download
                  className="mt-4 btn btn-primary inline-flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </a>
              </div>
            )}
          </div>
          <div className="bg-white rounded-b-xl shadow-2xl flex-shrink-0 p-4 border-t">
            <div className="flex justify-end gap-3">
              <a
                href={selectedDocument}
                download
                className="btn btn-secondary inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
              <button
                onClick={closeDocument}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const aadhaarUrl = getDocumentUrl(kyc.aadhaar_image || kyc.aadhar_image_path);
  const panUrl = getDocumentUrl(kyc.pan_image || kyc.pan_image_path);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative mx-auto w-full max-w-6xl card shadow-2xl animate-scale-in max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="card-header flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {type === 'borrower' ? 'Borrower' : 'Lender'} KYC Review
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Review all details and documents before verification
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="card-body space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                kyc.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                kyc.kyc_status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                Status: {kyc.kyc_status?.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Submitted: {formatDate(kyc.created_at)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Personal & Identity Information */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                      <p className="text-sm font-medium text-gray-900">{kyc.full_name || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Age</label>
                        <p className="text-sm font-medium text-gray-900">{kyc.age || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gender</label>
                        <p className="text-sm font-medium text-gray-900">{kyc.gender || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contact Number</label>
                      <p className="text-sm font-medium text-gray-900">{kyc.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                      <p className="text-sm font-medium text-gray-900">{kyc.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Identity Documents */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    Identity Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Aadhaar Number</label>
                      <p className="text-sm font-medium text-gray-900">{kyc.aadhaar_number || kyc.aadhar_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PAN Number</label>
                      <p className="text-sm font-medium text-gray-900">{kyc.pan_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Uploaded Documents
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Aadhaar Document</span>
                        {aadhaarUrl ? (
                          <div className="flex gap-2">
                            <a
                              href={aadhaarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary text-xs py-1 px-3 inline-flex items-center"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Open in Tab
                            </a>
                            <button
                              onClick={() => openDocument(kyc.aadhaar_image || kyc.aadhar_image_path, 'Aadhaar')}
                              className="btn btn-secondary text-xs py-1 px-3"
                            >
                              View Here
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-red-500">Not uploaded</span>
                        )}
                      </div>
                      {aadhaarUrl && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 truncate mb-1">
                            File: {kyc.aadhaar_image || kyc.aadhar_image_path}
                          </p>
                          <p className="text-xs text-blue-600">URL: {aadhaarUrl}</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">PAN Document</span>
                        {panUrl ? (
                          <div className="flex gap-2">
                            <a
                              href={panUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary text-xs py-1 px-3 inline-flex items-center"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Open in Tab
                            </a>
                            <button
                              onClick={() => openDocument(kyc.pan_image || kyc.pan_image_path, 'PAN')}
                              className="btn btn-secondary text-xs py-1 px-3"
                            >
                              View Here
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-red-500">Not uploaded</span>
                        )}
                      </div>
                      {panUrl && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 truncate mb-1">
                            File: {kyc.pan_image || kyc.pan_image_path}
                          </p>
                          <p className="text-xs text-blue-600">URL: {panUrl}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Employment/Financial Information */}
              <div className="space-y-6">
                {type === 'borrower' ? (
                  <>
                    {/* Employment Information */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary-600" />
                        Employment Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Employment Type</label>
                          <p className="text-sm font-medium text-gray-900">{kyc.employment_type || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Monthly Income</label>
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(kyc.monthly_income)}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Years of Job Stability</label>
                          <p className="text-sm font-medium text-gray-900">{kyc.years_of_job_stability || 'N/A'} years</p>
                        </div>
                      </div>
                    </div>

                    {/* Loan Information */}
                    {(kyc.previous_loans || kyc.loan_type || kyc.current_outstanding_loan) && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary-600" />
                          Loan & Credit History
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Previous Loans</label>
                            <p className="text-sm font-medium text-gray-900">
                              {kyc.previous_loans === 'true' || kyc.previous_loans === true ? 'Yes' : 'No'}
                            </p>
                          </div>
                          {kyc.loan_type && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Loan Type</label>
                              <p className="text-sm font-medium text-gray-900">{kyc.loan_type}</p>
                            </div>
                          )}
                          {kyc.total_loan_amount_taken && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Loan Amount</label>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(kyc.total_loan_amount_taken)}</p>
                            </div>
                          )}
                          {kyc.current_outstanding_loan && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Outstanding</label>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(kyc.current_outstanding_loan)}</p>
                            </div>
                          )}
                          {kyc.average_emi_per_month && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Average EMI/Month</label>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(kyc.average_emi_per_month)}</p>
                            </div>
                          )}
                          {kyc.credit_card_repayment_behavior && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Credit Card Behavior</label>
                              <p className="text-sm font-medium text-gray-900">{kyc.credit_card_repayment_behavior}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Financial Information */}
                    {(kyc.approx_monthly_expenses || kyc.maintains_savings_monthly !== undefined || kyc.pays_bills !== undefined) && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary-600" />
                          Financial Information
                        </h4>
                        <div className="space-y-4">
                          {kyc.approx_monthly_expenses && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Monthly Expenses</label>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(kyc.approx_monthly_expenses)}</p>
                            </div>
                          )}
                          {kyc.major_spending_categories && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Spending Categories</label>
                              <p className="text-sm font-medium text-gray-900">
                                {typeof kyc.major_spending_categories === 'string' 
                                  ? JSON.parse(kyc.major_spending_categories).join(', ') 
                                  : Array.isArray(kyc.major_spending_categories) 
                                    ? kyc.major_spending_categories.join(', ')
                                    : 'N/A'}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Maintains Savings</label>
                              <p className="text-sm font-medium text-gray-900">
                                {kyc.maintains_savings_monthly ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pays Bills</label>
                              <p className="text-sm font-medium text-gray-900">
                                {kyc.pays_bills ? 'Yes' : 'No'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Lender Information */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        Investment Information
                      </h4>
                      <div className="space-y-4">
                        {kyc.available_funds && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Available Funds</label>
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(kyc.available_funds)}</p>
                          </div>
                        )}
                        {kyc.investment_experience && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Investment Experience</label>
                            <p className="text-sm font-medium text-gray-900">{kyc.investment_experience}</p>
                          </div>
                        )}
                        {kyc.investment_amount && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Investment Amount</label>
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(kyc.investment_amount)}</p>
                          </div>
                        )}
                        {kyc.risk_tolerance && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Risk Tolerance</label>
                            <p className="text-sm font-medium text-gray-900">{kyc.risk_tolerance}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 bg-gray-50 px-6 py-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={() => onReject(kyc.userId)}
              className="btn btn-danger inline-flex items-center"
              disabled={isLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>
            <button
              onClick={() => onApprove(kyc.userId)}
              className="btn btn-success inline-flex items-center"
              disabled={isLoading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {renderDocumentViewer()}
    </>
  );
};

export default KYCReviewModal;

