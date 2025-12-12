import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { uploadLenderKYC, clearError, clearUploadSuccess } from '@/store/slices/kycSlice';
import Layout from '../Layout';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const LenderKYC = () => {
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
    investment_experience: '',
    investment_amount: '',
    risk_tolerance: '',
    preferred_loan_duration: '',
    income_source: '',
    annual_income: '',
    investment_goals: '',
    interest_rate: '',
  });

  const [files, setFiles] = useState({
    aadhar: null,
    pan: null,
  });

  useEffect(() => {
    if (uploadSuccess) {
      setTimeout(() => {
        navigate('/lender-dashboard');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only send fields that exist in LenderProfile schema
    // Map aadhaar_number to aadhar_number for backend compatibility
    const submitData = {
      aadhar_number: formData.aadhaar_number, // Map to backend field name
      pan_number: formData.pan_number,
      // Use investment_amount or annual_income as available_funds, convert to number
      available_funds: formData.investment_amount 
        ? Number(formData.investment_amount) 
        : (formData.annual_income ? Number(formData.annual_income) : ''),
      interest_rate: formData.interest_rate ? Number(formData.interest_rate) : '',
      aadhar: files.aadhar,
      pan: files.pan,
    };

    // Validate required fields
    if (!submitData.aadhar_number || !submitData.pan_number) {
      alert('Please fill in Aadhaar number and PAN number');
      return;
    }
    
    if (!files.aadhar || !files.pan) {
      alert('Please upload both Aadhaar and PAN documents');
      return;
    }

    // Validate interest rate
    if (!formData.interest_rate || formData.interest_rate === '') {
      alert('Please enter an interest rate');
      return;
    }

    const interestRate = Number(formData.interest_rate);
    if (isNaN(interestRate) || interestRate < 5 || interestRate > 12) {
      alert('Interest rate must be between 5% and 12%');
      return;
    }

    console.log('📤 Submitting Lender KYC:', submitData);
    dispatch(uploadLenderKYC(submitData));
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
            to="/lender-dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Lender KYC Verification">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Complete Your KYC Verification</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please provide accurate information to verify your identity and enable lending.
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
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
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
              </div>
            </div>

            {/* Investment Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Investment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Investment Experience</label>
                  <select
                    name="investment_experience"
                    required
                    value={formData.investment_experience}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="experienced">Experienced (5+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Investment Amount (₹)</label>
                  <input
                    type="number"
                    name="investment_amount"
                    required
                    value={formData.investment_amount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Risk Tolerance</label>
                  <select
                    name="risk_tolerance"
                    required
                    value={formData.risk_tolerance}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Risk Tolerance</option>
                    <option value="low">Low Risk</option>
                    <option value="moderate">Moderate Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Loan Duration</label>
                  <select
                    name="preferred_loan_duration"
                    value={formData.preferred_loan_duration}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Duration</option>
                    <option value="3-6">3-6 months</option>
                    <option value="6-12">6-12 months</option>
                    <option value="12-24">12-24 months</option>
                    <option value="24+">24+ months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Income Source</label>
                  <input
                    type="text"
                    name="income_source"
                    value={formData.income_source}
                    onChange={handleInputChange}
                    placeholder="e.g., Salary, Business, Investments"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Annual Income (₹)</label>
                  <input
                    type="number"
                    name="annual_income"
                    value={formData.annual_income}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    name="interest_rate"
                    step="0.1"
                    min="5"
                    max="12"
                    required
                    value={formData.interest_rate}
                    onChange={handleInputChange}
                    placeholder="e.g., 8.5"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter your preferred interest rate as a percentage (must be between 5% and 12%)</p>
                </div>
              </div>
            </div>

            {/* Investment Goals */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Investment Goals</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700">Investment Goals</label>
                <textarea
                  name="investment_goals"
                  rows="3"
                  value={formData.investment_goals}
                  onChange={handleInputChange}
                  placeholder="Describe your investment goals and expectations..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link
                to="/lender-dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
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

export default LenderKYC;