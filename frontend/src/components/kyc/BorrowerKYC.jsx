import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { uploadBorrowerKYC, clearError, clearUploadSuccess } from '@/store/slices/kycSlice';
import Layout from '../Layout';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const BorrowerKYC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, uploadSuccess } = useSelector((state) => state.kyc);
  
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    contact_number: '',
    email: '',
    aadhaar_number: '',
    pan_number: '',
    employment_type: '',
    monthly_income: '',
    years_of_job_stability: '',
    previous_loans: false,
    loan_type: '',
    total_loan_amount_taken: '',
    current_outstanding_loan: '',
    loan_defaults_last_12_months: '',
    average_emi_per_month: '',
    missed_emi_payments: '',
    credit_card_repayment_behavior: '',
    approx_monthly_expenses: '',
    major_spending_categories: [],
    maintains_savings_monthly: false,
    pays_bills: false,
    types_of_bills: [],
    missed_utility_payments: '',
  });

  const [files, setFiles] = useState({
    aadhar: null,
    pan: null,
  });

  useEffect(() => {
    if (uploadSuccess) {
      setTimeout(() => {
        navigate('/borrower-dashboard');
      }, 2000);
    }
  }, [uploadSuccess, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearUploadSuccess());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: selectedFiles[0]
    }));
  };

  const handleArrayChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      major_spending_categories: JSON.stringify(formData.major_spending_categories),
      types_of_bills: JSON.stringify(formData.types_of_bills),
      aadhar: files.aadhar,
      pan: files.pan,
    };

    dispatch(uploadBorrowerKYC(submitData));
  };

  if (uploadSuccess) {
    return (
      <Layout title="KYC Submission">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Submitted Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your KYC documents have been submitted for review. You will be notified once they are verified.
          </p>
          <Link
            to="/borrower-dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Borrower KYC Verification">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Complete Your KYC Verification</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please provide accurate information to verify your identity and enable borrowing.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    name="contact_number"
                    required
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Identity Documents */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Identity Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaar_number"
                    required
                    value={formData.aadhaar_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                  <input
                    type="text"
                    name="pan_number"
                    required
                    value={formData.pan_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Aadhaar</label>
                  <input
                    type="file"
                    name="aadhar"
                    required
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload PAN</label>
                  <input
                    type="file"
                    name="pan"
                    required
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                  <select
                    name="employment_type"
                    required
                    value={formData.employment_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employment Type</option>
                    <option value="salaried">Salaried</option>
                    <option value="self_employed">Self Employed</option>
                    <option value="business">Business Owner</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Income (₹)</label>
                  <input
                    type="number"
                    name="monthly_income"
                    required
                    value={formData.monthly_income}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Job Stability</label>
                  <input
                    type="number"
                    name="years_of_job_stability"
                    value={formData.years_of_job_stability}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link
                to="/borrower-dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit KYC'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default BorrowerKYC;