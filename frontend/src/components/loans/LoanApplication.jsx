import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { submitLoanApplication, clearError, clearSubmitSuccess, getLoanEligibility, getMyLoanApplications } from '@/store/slices/loanSlice';
import { getBorrowerKYCStatus } from '@/store/slices/kycSlice';
import Layout from '../Layout';
import { CreditCard, Calendar, FileText, AlertCircle, CheckCircle, TrendingUp, Info, Clock } from 'lucide-react';
import { calculateMaxLoanAmount, calculateEMI } from '@/utils/loanEligibility';

const LoanApplication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, submitSuccess, eligibility, myApplications } = useSelector((state) => state.loan);
  const { borrowerKycStatus, isLoading: kycLoading } = useSelector((state) => state.kyc);

  const [formData, setFormData] = useState({
    loanAmount: '',
    loanPurpose: '',
    loanTenureMonths: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch KYC status on component mount
  useEffect(() => {
    dispatch(getBorrowerKYCStatus());
  }, [dispatch]);

  // Check KYC status (only after it's been fetched)
  // Wait for KYC status to load before making decisions
  const isKycStatusLoading = kycLoading === true;
  
  // Handle different response formats from backend
  const kycStatus = borrowerKycStatus?.kyc_status || 
                    borrowerKycStatus?.data?.kyc_status || 
                    borrowerKycStatus?.status;
  
  const isKycApproved = kycStatus === 'approved';
  
  // Only show error if KYC status has been loaded and is not approved
  // Don't show error if status is still loading or hasn't been fetched yet
  // Check if we have any KYC status data (could be object with kyc_status or just the status)
  const hasKycStatusLoaded = borrowerKycStatus !== null && 
                              borrowerKycStatus !== undefined && 
                              !isKycStatusLoading;
  
  const shouldShowKycError = hasKycStatusLoaded && kycStatus && kycStatus !== 'approved';

  useEffect(() => {
    if (submitSuccess) {
      setTimeout(() => {
        navigate('/borrower-dashboard');
      }, 2000);
    }
  }, [submitSuccess, navigate]);

  useEffect(() => {
    // Fetch loan eligibility and check for pending loans when KYC is approved
    if (isKycApproved) {
      dispatch(getLoanEligibility());
      dispatch(getMyLoanApplications());
    }

    return () => {
      dispatch(clearError());
      dispatch(clearSubmitSuccess());
    };
  }, [dispatch, isKycApproved]);

  // Check if user has pending loan applications
  const hasPendingLoans = myApplications && myApplications.some(
    app => app.status === 'PENDING' || app.status === 'UNDER_REVIEW'
  );
  
  const pendingLoans = myApplications ? myApplications.filter(
    app => app.status === 'PENDING' || app.status === 'UNDER_REVIEW'
  ) : [];

  // Calculate max eligible loan dynamically for ANY tenure value
  // This ensures it works for any tenure the user enters (4, 7, 12, 15, etc.)
  const maxEligibleLoan = useMemo(() => {
    try {
      if (!eligibility) {
        return 0;
      }

      const selectedTenure = formData.loanTenureMonths ? Number(formData.loanTenureMonths) : 24;
      
      // If we have eligibility data, calculate for the selected tenure dynamically
      if (eligibility.monthlyIncome && selectedTenure > 0) {
        const monthlyIncome = eligibility.monthlyIncome;
        const existingEMI = eligibility.existingEMI || 0;
        const riskCategory = eligibility.riskCategory;
        
        // Calculate eligibility for the exact tenure selected (works for ANY tenure value)
        // Cap at maximum allowed loan amount of ₹5,00,000
        const calculatedAmount = calculateMaxLoanAmount(
          monthlyIncome,
          existingEMI,
          selectedTenure,
          12, // 12% annual interest rate
          0.40, // 40% FOIR
          riskCategory
        );
        return Math.min(calculatedAmount, 500000); // Cap at ₹5,00,000
      }
      
      // Fallback to backend calculated values if available (for predefined tenures)
      // Cap at maximum allowed loan amount of ₹5,00,000
      if (eligibility.eligibilityByTenure?.[selectedTenure]) {
        const backendAmount = eligibility.eligibilityByTenure[selectedTenure].maxEligibleLoan || 0;
        return Math.min(backendAmount, 500000); // Cap at ₹5,00,000
      }
      
      // Default to 24 months if no tenure selected
      const defaultAmount = eligibility.eligibilityByTenure?.[24]?.maxEligibleLoan || eligibility.maxEligibleLoan || 0;
      return Math.min(defaultAmount, 500000); // Cap at ₹5,00,000
    } catch (error) {
      console.error('Error calculating max eligible loan:', error);
      return 0;
    }
  }, [eligibility, formData.loanTenureMonths]);

  // Get current tenure for display (use selected tenure or default to 24)
  const currentTenure = formData.loanTenureMonths ? Number(formData.loanTenureMonths) : 24;
  
  // Calculate estimated EMI for max eligible loan at current tenure (works for ANY tenure)
  const estimatedEMIForMaxLoan = useMemo(() => {
    if (maxEligibleLoan > 0 && currentTenure > 0) {
      return calculateEMI(maxEligibleLoan, currentTenure);
    }
    return 0;
  }, [maxEligibleLoan, currentTenure]);

  // Validate loan amount against eligibility when eligibility or amount changes
  useEffect(() => {
    try {
      if (eligibility && formData.loanAmount && maxEligibleLoan > 0) {
        const amountValue = Number(formData.loanAmount);
        if (!isNaN(amountValue) && amountValue > 0) {
          if (amountValue > maxEligibleLoan) {
            setErrors(prev => ({
              ...prev,
              loanAmount: `Loan amount exceeds your eligibility. Maximum eligible loan amount: ₹${maxEligibleLoan.toLocaleString('en-IN')}. You cannot exceed this limit.`
            }));
          } else {
            // Clear error if amount is within eligibility
            setErrors(prev => {
              const newErrors = { ...prev };
              if (newErrors.loanAmount && newErrors.loanAmount.includes('exceeds your eligibility')) {
                delete newErrors.loanAmount;
              }
              return newErrors;
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in eligibility validation useEffect:', error);
    }
  }, [eligibility, maxEligibleLoan, formData.loanAmount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation for loan tenure
    if (name === 'loanTenureMonths') {
      if (value === '') {
        // Clear error if field is empty (will be validated on submit)
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.loanTenureMonths;
          return newErrors;
        });
      } else {
        const tenureValue = Number(value);
        if (!isNaN(tenureValue)) {
          if (tenureValue < 6) {
            setErrors(prev => ({
              ...prev,
              loanTenureMonths: 'Minimum loan tenure is 6 months'
            }));
          } else if (tenureValue > 60) {
            setErrors(prev => ({
              ...prev,
              loanTenureMonths: 'Maximum loan tenure is 60 months. You cannot exceed 60 months.'
            }));
          } else if (!Number.isInteger(tenureValue)) {
            setErrors(prev => ({
              ...prev,
              loanTenureMonths: 'Loan tenure must be a whole number of months'
            }));
          } else {
            // Clear error if valid
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.loanTenureMonths;
              return newErrors;
            });
          }
        }
      }
    }

    // Real-time validation for loan amount against eligibility
    if (name === 'loanAmount') {
      if (value === '') {
        // Clear error if field is empty
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.loanAmount;
          return newErrors;
        });
      } else {
        const amountValue = Number(value);
        if (!isNaN(amountValue) && amountValue > 0) {
          // First check basic validation rules
          if (amountValue < 10000) {
            setErrors(prev => ({
              ...prev,
              loanAmount: 'Minimum loan amount is ₹10,000'
            }));
          } else if (amountValue > 500000) {
            setErrors(prev => ({
              ...prev,
              loanAmount: 'Maximum loan amount is ₹5,00,000'
            }));
          } else if (!Number.isInteger(amountValue)) {
            setErrors(prev => ({
              ...prev,
              loanAmount: 'Loan amount must be a whole number'
            }));
          } else {
            // Clear basic validation errors if passed
            setErrors(prev => {
              const newErrors = { ...prev };
              if (newErrors.loanAmount && 
                  (newErrors.loanAmount.includes('Minimum') || 
                   newErrors.loanAmount.includes('Maximum') ||
                   newErrors.loanAmount.includes('whole number'))) {
                delete newErrors.loanAmount;
              }
              return newErrors;
            });
          }
          
          // Validate against eligibility if available (this runs for all valid amounts)
          if (eligibility && maxEligibleLoan > 0) {
            if (amountValue > maxEligibleLoan) {
              setErrors(prev => ({
                ...prev,
                loanAmount: `Loan amount exceeds your eligibility. Maximum eligible loan amount: ₹${maxEligibleLoan.toLocaleString('en-IN')}. You cannot exceed this limit.`
              }));
            } else {
              // Clear eligibility error if amount is within eligibility
              setErrors(prev => {
                const newErrors = { ...prev };
                if (newErrors.loanAmount && newErrors.loanAmount.includes('exceeds your eligibility')) {
                  delete newErrors.loanAmount;
                }
                return newErrors;
              });
            }
          }
        }
      }
    } else if (name === 'loanTenureMonths') {
      // When tenure changes, revalidate loan amount against new eligibility
      // This will be handled by the useEffect that watches maxEligibleLoan
    } else if (name === 'loanPurpose') {
      // Real-time validation for loan purpose
      if (value === '') {
        // Clear error if field is empty (will be validated on submit)
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.loanPurpose;
          return newErrors;
        });
      } else {
        const purpose = value.trim();
        if (purpose.length < 10) {
          setErrors(prev => ({
            ...prev,
            loanPurpose: 'Loan purpose must be at least 10 characters'
          }));
        } else if (purpose.length > 500) {
          setErrors(prev => ({
            ...prev,
            loanPurpose: 'Loan purpose cannot exceed 500 characters'
          }));
        } else if (!/^[a-zA-Z0-9\s.,!?()-]+$/.test(purpose)) {
          setErrors(prev => ({
            ...prev,
            loanPurpose: 'Loan purpose contains invalid characters'
          }));
        } else {
          // Clear error if valid
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.loanPurpose;
            return newErrors;
          });
        }
      }
    } else {
      // Clear error for other fields
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Loan Amount validation
    if (!formData.loanAmount || formData.loanAmount === '') {
      newErrors.loanAmount = 'Loan amount is required';
    } else {
      const amount = Number(formData.loanAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.loanAmount = 'Loan amount must be a positive number';
      } else if (amount < 10000) {
        newErrors.loanAmount = 'Minimum loan amount is ₹10,000';
      } else if (amount > 500000) {
        newErrors.loanAmount = 'Maximum loan amount is ₹5,00,000';
      } else if (!Number.isInteger(amount)) {
        newErrors.loanAmount = 'Loan amount must be a whole number';
      } else {
        // Check against eligibility for the selected tenure (calculate dynamically)
        const selectedTenure = Number(formData.loanTenureMonths) || 24;
        let maxEligible = 0;
        
        if (eligibility?.monthlyIncome) {
          // Calculate dynamically for the selected tenure (works for ANY tenure value)
          // Cap at maximum allowed loan amount of ₹5,00,000
          const calculatedAmount = calculateMaxLoanAmount(
            eligibility.monthlyIncome,
            eligibility.existingEMI || 0,
            selectedTenure,
            12,
            0.40,
            eligibility.riskCategory
          );
          maxEligible = Math.min(calculatedAmount, 500000); // Cap at ₹5,00,000
        } else {
          // Fallback to backend calculated values
          const backendAmount = eligibility?.eligibilityByTenure?.[selectedTenure]?.maxEligibleLoan || 
                               eligibility?.maxEligibleLoan || 0;
          maxEligible = Math.min(backendAmount, 500000); // Cap at ₹5,00,000
        }
        
        if (maxEligible > 0 && amount > maxEligible) {
          newErrors.loanAmount = `Loan amount exceeds your eligibility. Maximum eligible loan amount: ₹${maxEligible.toLocaleString('en-IN')}. You cannot exceed this limit.`;
        }
      }
    }

    // Loan Purpose validation
    if (!formData.loanPurpose || formData.loanPurpose.trim() === '') {
      newErrors.loanPurpose = 'Loan purpose is required';
    } else {
      const purpose = formData.loanPurpose.trim();
      if (purpose.length < 10) {
        newErrors.loanPurpose = 'Loan purpose must be at least 10 characters';
      } else if (purpose.length > 500) {
        newErrors.loanPurpose = 'Loan purpose cannot exceed 500 characters';
      } else if (!/^[a-zA-Z0-9\s.,!?()-]+$/.test(purpose)) {
        newErrors.loanPurpose = 'Loan purpose contains invalid characters';
      }
    }

    // Loan Tenure validation
    if (!formData.loanTenureMonths || formData.loanTenureMonths === '') {
      newErrors.loanTenureMonths = 'Loan tenure is required';
    } else {
      const tenure = Number(formData.loanTenureMonths);
      if (isNaN(tenure) || tenure <= 0) {
        newErrors.loanTenureMonths = 'Loan tenure must be a positive number';
      } else if (!Number.isInteger(tenure)) {
        newErrors.loanTenureMonths = 'Loan tenure must be a whole number of months';
      } else if (tenure < 6) {
        newErrors.loanTenureMonths = 'Minimum loan tenure is 6 months';
      } else if (tenure > 60) {
        newErrors.loanTenureMonths = 'Maximum loan tenure is 60 months. You cannot exceed 60 months.';
      }
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    // Double-check eligibility before submission
    const selectedTenure = Number(formData.loanTenureMonths) || 24;
    const requestedAmount = Number(formData.loanAmount);
    
    if (eligibility) {
      let maxEligible = 0;
      if (eligibility.monthlyIncome) {
        const calculatedAmount = calculateMaxLoanAmount(
          eligibility.monthlyIncome,
          eligibility.existingEMI || 0,
          selectedTenure,
          12,
          0.40,
          eligibility.riskCategory
        );
        maxEligible = Math.min(calculatedAmount, 500000);
      } else {
        const backendAmount = eligibility?.eligibilityByTenure?.[selectedTenure]?.maxEligibleLoan || 
                             eligibility?.maxEligibleLoan || 0;
        maxEligible = Math.min(backendAmount, 500000);
      }
      
      if (maxEligible > 0 && requestedAmount > maxEligible) {
        setErrors(prev => ({
          ...prev,
          loanAmount: `Loan amount exceeds your eligibility. Maximum eligible loan amount: ₹${maxEligible.toLocaleString('en-IN')}. You cannot exceed this limit.`
        }));
        // Scroll to error and prevent submission
        const element = document.getElementById('loanAmount');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
        return;
      }
    }

    const submitData = {
      loanAmount: Number(formData.loanAmount),
      loanPurpose: formData.loanPurpose.trim(),
      loanTenureMonths: Number(formData.loanTenureMonths),
      // Note: employmentType, monthlyIncome, and existingEMI are stored in BorrowerProfile
      // They are only used here for UI calculations (EMI estimation)
    };

    dispatch(submitLoanApplication(submitData));
  };

  // Calculate estimated EMI for the entered loan amount (using imported function)
  const estimatedEMI = useMemo(() => {
    const principal = Number(formData.loanAmount) || 0;
    const tenure = Number(formData.loanTenureMonths) || 0;
    
    if (principal > 0 && tenure > 0) {
      return calculateEMI(principal, tenure, 12); // 12% annual interest rate
    }
    return 0;
  }, [formData.loanAmount, formData.loanTenureMonths]);

  // Get user-friendly error message for submit button
  const getSubmitErrorMessage = () => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return null;

    // Get the first error
    const firstErrorKey = errorKeys[0];
    const firstError = errors[firstErrorKey];

    // Create user-friendly messages based on error type
    if (firstErrorKey === 'loanAmount') {
      if (firstError.includes('exceeds your eligibility')) {
        return 'Loan amount exceeds your eligibility limit';
      } else if (firstError.includes('Minimum')) {
        return 'Loan amount is too low (minimum ₹10,000)';
      } else if (firstError.includes('Maximum')) {
        return 'Loan amount is too high (maximum ₹5,00,000)';
      } else if (firstError.includes('required')) {
        return 'Please enter loan amount';
      }
      return 'Please check loan amount';
    } else if (firstErrorKey === 'loanTenureMonths') {
      if (firstError.includes('exceed 60 months')) {
        return 'Loan tenure cannot exceed 60 months';
      } else if (firstError.includes('Minimum')) {
        return 'Loan tenure is too short (minimum 6 months)';
      } else if (firstError.includes('required')) {
        return 'Please enter loan tenure';
      }
      return 'Please check loan tenure';
    } else if (firstErrorKey === 'loanPurpose') {
      if (firstError.includes('at least 10 characters')) {
        return 'Loan purpose is too short (minimum 10 characters)';
      } else if (firstError.includes('exceed 500 characters')) {
        return 'Loan purpose is too long (maximum 500 characters)';
      } else if (firstError.includes('required')) {
        return 'Please enter loan purpose';
      }
      return 'Please check loan purpose';
    }

    return 'Please fix the errors above';
  };

  const submitErrorMessage = getSubmitErrorMessage();

  // Show loading state while KYC status is being fetched
  if (isKycStatusLoading || !hasKycStatusLoaded) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Checking your KYC status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show KYC error only if status has been loaded and is not approved
  if (shouldShowKycError) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">KYC Verification Required</h2>
            <p className="text-gray-600 mb-6">
              {kycStatus === 'pending' 
                ? 'Your KYC is under review. Please wait for approval before applying for a loan.'
                : kycStatus === 'rejected'
                ? 'Your KYC was rejected. Please resubmit your KYC documents with correct information.'
                : 'Please complete your KYC verification first to apply for a loan.'}
            </p>
            <Link
              to="/borrower-kyc"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FileText className="h-5 w-5 mr-2" />
              {kycStatus === 'rejected' ? 'Resubmit KYC' : 'Complete KYC'}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Show warning if user has pending loans
  if (hasPendingLoans && isKycApproved) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-8">
            <div className="flex items-start mb-6">
              <div className="flex-shrink-0">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
              </div>
              <div className="ml-4 flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Loan Applications</h2>
                <p className="text-gray-600 mb-4">
                  You cannot apply for a new loan while you have pending loan applications. Please wait for your existing applications to be reviewed and completed before applying for a new loan.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    You have {pendingLoans.length} pending loan application{pendingLoans.length > 1 ? 's' : ''}:
                  </p>
                  <ul className="space-y-2">
                    {pendingLoans.map((loan) => (
                      <li key={loan.id} className="text-sm text-yellow-700 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Application #{loan.id} - ₹{loan.loanAmount.toLocaleString('en-IN')} 
                        ({loan.status === 'PENDING' ? 'Pending Review' : 'Under Review'})
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-4">
                  <Link
                    to="/my-loans"
                    className="btn btn-primary inline-flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View My Loans
                  </Link>
                  <Link
                    to="/borrower-dashboard"
                    className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (submitSuccess) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-8 text-center animate-fadeIn">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your loan application has been submitted and is under review. You will be notified once a decision is made.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for a Loan</h1>
          <p className="text-gray-600">Fill in the details below to submit your loan application</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Eligibility Banner */}
        {eligibility && maxEligibleLoan > 0 && (
          <div className="mb-6 card p-6 bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Loan Eligibility</h3>
                <p className="text-2xl font-bold text-primary-600 mb-2">
                  ₹{maxEligibleLoan.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Maximum eligible loan amount for <span className="font-semibold">{currentTenure} months</span> tenure
                  {!formData.loanTenureMonths && (
                    <span className="text-xs text-gray-500 ml-2 italic">
                      (Select tenure below to see eligibility for different tenures)
                    </span>
                  )}
                </p>
                {estimatedEMIForMaxLoan > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated EMI for max eligible amount: ₹{estimatedEMIForMaxLoan.toLocaleString('en-IN')}/month
                  </p>
                )}
                {!formData.loanTenureMonths && (
                  <p className="text-xs text-yellow-600 italic mb-3">
                    💡 Select a tenure below to see eligibility for that specific period
                  </p>
                )}
                {(eligibility.dti !== undefined && eligibility.dti !== null) || (eligibility.creditScore !== undefined && eligibility.creditScore !== null) ? (
                  <div className="flex items-center gap-4 text-xs mt-2">
                    {eligibility.dti !== undefined && eligibility.dti !== null && (
                      <span className={`px-2 py-1 rounded-full ${
                        eligibility.dtiRiskLevel === 'safe' ? 'bg-green-100 text-green-800' :
                        eligibility.dtiRiskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        DTI: {eligibility.dti}% ({eligibility.dtiRiskLevel})
                      </span>
                    )}
                    {eligibility.creditScore !== undefined && eligibility.creditScore !== null && eligibility.creditScore > 0 ? (
                      <span className="text-gray-600">
                        Credit Score: {eligibility.creditScore}
                      </span>
                    ) : eligibility.creditScore === 0 || eligibility.creditScore === null ? (
                      <span className="text-gray-500 italic">
                        Credit Score: Not yet calculated
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {eligibility && eligibility.maxEligibleLoan === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 font-medium">Not Currently Eligible</p>
              <p className="text-yellow-600 text-sm mt-1">
                {eligibility.message || 'Please update your income or reduce existing EMIs to become eligible for a loan.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
              Loan Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Amount */}
              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="loanAmount"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                      // Additional validation on blur to catch values that exceed eligibility
                      const amount = Number(e.target.value);
                      const selectedTenure = Number(formData.loanTenureMonths) || 24;
                      
                      if (eligibility && amount > 0 && selectedTenure >= 6 && selectedTenure <= 60) {
                        let maxEligible = 0;
                        if (eligibility.monthlyIncome) {
                          const calculatedAmount = calculateMaxLoanAmount(
                            eligibility.monthlyIncome,
                            eligibility.existingEMI || 0,
                            selectedTenure,
                            12,
                            0.40,
                            eligibility.riskCategory
                          );
                          maxEligible = Math.min(calculatedAmount, 500000);
                        } else {
                          const backendAmount = eligibility?.eligibilityByTenure?.[selectedTenure]?.maxEligibleLoan || 
                                               eligibility?.maxEligibleLoan || 0;
                          maxEligible = Math.min(backendAmount, 500000);
                        }
                        
                        if (maxEligible > 0 && amount > maxEligible) {
                          setErrors(prev => ({
                            ...prev,
                            loanAmount: `Loan amount exceeds your eligibility. Maximum eligible loan amount: ₹${maxEligible.toLocaleString('en-IN')}. You cannot exceed this limit.`
                          }));
                        }
                      }
                    }}
                    min="10000"
                    max={maxEligibleLoan > 0 ? Math.min(maxEligibleLoan, 500000) : 500000}
                    step="1"
                    className={`input-focus-animate w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.loanAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 500000"
                  />
                  <CreditCard className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.loanAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.loanAmount}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {maxEligibleLoan > 0 
                    ? `Range: ₹10,000 - ₹${Math.min(maxEligibleLoan, 500000).toLocaleString('en-IN')} (Your max eligible: ₹${maxEligibleLoan.toLocaleString('en-IN')})`
                    : 'Range: ₹10,000 - ₹5,00,000'}
                </p>
              </div>

              {/* Loan Tenure */}
              <div>
                <label htmlFor="loanTenureMonths" className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Tenure (Months) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="loanTenureMonths"
                    name="loanTenureMonths"
                    value={formData.loanTenureMonths}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                      // Additional validation on blur to catch values that bypass min/max
                      const tenure = Number(e.target.value);
                      if (tenure > 60) {
                        setErrors(prev => ({
                          ...prev,
                          loanTenureMonths: 'Maximum loan tenure is 60 months. You cannot exceed 60 months.'
                        }));
                      }
                    }}
                    min="6"
                    max="60"
                    step="1"
                    className={`input-focus-animate w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.loanTenureMonths ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 24"
                  />
                  <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.loanTenureMonths && (
                  <p className="mt-1 text-sm text-red-600">{errors.loanTenureMonths}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Range: 6 - 60 months</p>
              </div>
            </div>

            {/* Loan Purpose */}
            <div className="mt-6">
              <label htmlFor="loanPurpose" className="block text-sm font-medium text-gray-700 mb-2">
                Loan Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                id="loanPurpose"
                name="loanPurpose"
                value={formData.loanPurpose}
                onChange={handleInputChange}
                rows="4"
                className={`input-focus-animate w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.loanPurpose ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please describe the purpose of this loan in detail (e.g., Home renovation, Business expansion, Medical emergency, etc.)"
              />
              {errors.loanPurpose && (
                <p className="mt-1 text-sm text-red-600">{errors.loanPurpose}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Minimum 10 characters required</p>
            </div>
          </div>

          {/* EMI Estimate */}
          {estimatedEMI > 0 && (
            <div className="card p-6 bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Estimated Monthly EMI</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">₹{estimatedEMI.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 mt-1">*Based on 12% annual interest rate (subject to change)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="text-lg font-semibold text-gray-900">₹{Number(formData.loanAmount).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-600 mt-1">Tenure</p>
                  <p className="text-lg font-semibold text-gray-900">{formData.loanTenureMonths} months</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/borrower-dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="btn-ripple px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : Object.keys(errors).length > 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {submitErrorMessage || 'Please fix errors to submit'}
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default LoanApplication;

