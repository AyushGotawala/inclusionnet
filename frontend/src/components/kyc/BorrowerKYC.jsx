import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { uploadBorrowerKYC, clearError, clearUploadSuccess } from '@/store/slices/kycSlice';
import Layout from '../Layout';
import { Upload, FileText, AlertCircle, CheckCircle, User } from 'lucide-react';

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
    
    // Helper function to convert empty strings to null for optional fields
    const toNumberOrNull = (val) => {
      if (!val || val === '' || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    // Helper function to handle empty strings
    const toStringOrNull = (val) => {
      if (!val || val === '' || val === null || val === undefined) return null;
      return String(val);
    };

    // Convert form data to proper types
    // Note: FormData converts null to string "null", so we'll use empty strings for optional fields
    const submitData = {
      // Required fields
      full_name: formData.full_name,
      age: Number(formData.age),
      gender: formData.gender,
      contact_number: formData.contact_number,
      email: formData.email,
      aadhaar_number: formData.aadhaar_number,
      pan_number: formData.pan_number,
      employment_type: formData.employment_type,
      monthly_income: Number(formData.monthly_income),
      // Optional fields - use empty string if empty (FormData will handle it)
      years_of_job_stability: formData.years_of_job_stability || '',
      loan_type: formData.loan_type || '',
      total_loan_amount_taken: formData.total_loan_amount_taken || '',
      current_outstanding_loan: formData.current_outstanding_loan || '',
      loan_defaults_last_12_months: formData.loan_defaults_last_12_months || '',
      average_emi_per_month: formData.average_emi_per_month || '',
      missed_emi_payments: formData.missed_emi_payments || '',
      credit_card_repayment_behavior: formData.credit_card_repayment_behavior || '',
      approx_monthly_expenses: formData.approx_monthly_expenses || '',
      missed_utility_payments: formData.missed_utility_payments || '',
      // Convert arrays to JSON strings (empty array becomes empty string)
      major_spending_categories: formData.major_spending_categories.length > 0 
        ? JSON.stringify(formData.major_spending_categories) 
        : '',
      types_of_bills: formData.types_of_bills.length > 0 
        ? JSON.stringify(formData.types_of_bills) 
        : '',
      // Boolean fields
      previous_loans: formData.previous_loans,
      maintains_savings_monthly: formData.maintains_savings_monthly,
      pays_bills: formData.pays_bills,
      // Add files
      aadhar: files.aadhar,
      pan: files.pan,
    };

    dispatch(uploadBorrowerKYC(submitData));
  };

  if (uploadSuccess) {
    return (
      <Layout title="KYC Submission">
        <div className="max-w-md mx-auto card text-center">
          <div className="card-body py-12">
            <div className="h-20 w-20 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">KYC Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6 text-lg">
            Your KYC documents have been submitted for review. You will be notified once they are verified.
          </p>
          <Link
            to="/borrower-dashboard"
              className="btn btn-primary inline-flex items-center"
          >
            Back to Dashboard
          </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Borrower KYC Verification">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="card-header">
            <h3 className="text-2xl font-bold text-gray-900">Complete Your KYC Verification</h3>
            <p className="mt-2 text-base text-gray-600">
              Please provide accurate information to verify your identity and enable borrowing.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 alert alert-danger">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-danger-500 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card-body space-y-8">
            {/* Personal Information */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contact_number"
                    required
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Identity Documents */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                Identity Documents
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaar_number"
                    required
                    value={formData.aadhaar_number}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    name="pan_number"
                    required
                    value={formData.pan_number}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Aadhaar</label>
                  <input
                    type="file"
                    name="aadhar"
                    required
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload PAN</label>
                  <input
                    type="file"
                    name="pan"
                    required
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-success-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-success-600" />
                </div>
                Employment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                  <select
                    name="employment_type"
                    required
                    value={formData.employment_type}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select Employment Type</option>
                    <option value="salaried">Salaried</option>
                    <option value="self_employed">Self Employed</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Income (₹)</label>
                  <input
                    type="number"
                    name="monthly_income"
                    required
                    value={formData.monthly_income}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Job Stability</label>
                  <input
                    type="number"
                    name="years_of_job_stability"
                    value={formData.years_of_job_stability}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Loan & Credit History */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-warning-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-warning-600" />
                </div>
                Loan & Credit History
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      name="previous_loans"
                      checked={formData.previous_loans}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Have you taken previous loans?</span>
                  </label>
                </div>
                {formData.previous_loans && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Type</label>
                      <select
                        name="loan_type"
                        value={formData.loan_type}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select Loan Type</option>
                        <option value="personal">Personal</option>
                        <option value="education">Education</option>
                        <option value="home">Home</option>
                        <option value="credit_card">Credit Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Total Loan Amount Taken (₹)</label>
                      <input
                        type="number"
                        name="total_loan_amount_taken"
                        value={formData.total_loan_amount_taken}
                        onChange={handleInputChange}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Outstanding Loan (₹)</label>
                      <input
                        type="number"
                        name="current_outstanding_loan"
                        value={formData.current_outstanding_loan}
                        onChange={handleInputChange}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Defaults in Last 12 Months</label>
                      <input
                        type="number"
                        name="loan_defaults_last_12_months"
                        value={formData.loan_defaults_last_12_months}
                        onChange={handleInputChange}
                        min="0"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Average EMI per Month (₹)</label>
                      <input
                        type="number"
                        name="average_emi_per_month"
                        value={formData.average_emi_per_month}
                        onChange={handleInputChange}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Missed EMI Payments</label>
                      <input
                        type="number"
                        name="missed_emi_payments"
                        value={formData.missed_emi_payments}
                        onChange={handleInputChange}
                        min="0"
                        className="input"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Card Repayment Behavior</label>
                  <select
                    name="credit_card_repayment_behavior"
                    value={formData.credit_card_repayment_behavior}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select Behavior</option>
                    <option value="always_full">Always pay full amount</option>
                    <option value="minimum">Pay minimum amount</option>
                    <option value="partial">Pay partial amount</option>
                    <option value="no_credit_card">No credit card</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-info-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-info-600" />
                </div>
                Financial Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Approximate Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    name="approx_monthly_expenses"
                    value={formData.approx_monthly_expenses}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Major Spending Categories</label>
                  <div className="space-y-2">
                    {['Food & Groceries', 'Transportation', 'Entertainment', 'Healthcare', 'Education', 'Shopping', 'Bills & Utilities', 'Others'].map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.major_spending_categories.includes(category)}
                          onChange={(e) => handleArrayChange('major_spending_categories', category, e.target.checked)}
                          className="h-4 w-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      name="maintains_savings_monthly"
                      checked={formData.maintains_savings_monthly}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Maintains savings monthly</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Utility Payments */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                Utility Payments
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      name="pays_bills"
                      checked={formData.pays_bills}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Pays bills on time</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Types of Bills</label>
                  <div className="space-y-2">
                    {['Electricity', 'Water', 'Gas', 'Internet', 'Phone', 'Cable TV', 'Insurance'].map(bill => (
                      <label key={bill} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.types_of_bills.includes(bill)}
                          onChange={(e) => handleArrayChange('types_of_bills', bill, e.target.checked)}
                          className="h-4 w-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{bill}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Missed Utility Payments (Count)</label>
                  <input
                    type="number"
                    name="missed_utility_payments"
                    value={formData.missed_utility_payments}
                    onChange={handleInputChange}
                    min="0"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/borrower-dashboard"
                className="btn btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit KYC'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default BorrowerKYC;