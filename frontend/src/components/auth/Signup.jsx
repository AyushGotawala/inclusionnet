import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup, clearError } from '@/store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Logo from '../Logo';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'BORROWER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordMatch) {
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    
    try {
      await dispatch(signup(submitData)).unwrap();
      setSignupSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      // Error is handled by the slice
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card py-10 px-6 sm:px-10 text-center">
            <div className="h-20 w-20 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Account Created!</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Your account has been successfully created. You will be redirected to login shortly.
            </p>
            <Link
              to="/login"
              className="btn btn-primary inline-flex items-center"
            >
              Go to Login
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" showText={false} />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-lg text-gray-600">
          Join our peer-to-peer lending platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-10 px-6 sm:px-10">
          {error && (
            <div className="mb-6 alert alert-danger">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-danger-500 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="BORROWER"
                    checked={formData.role === 'BORROWER'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-xl text-center transition-all duration-200 hover:shadow-lg ${
                    formData.role === 'BORROWER'
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  }`}>
                    <div className={`h-8 w-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      formData.role === 'BORROWER' ? 'bg-primary-600' : 'bg-gray-200'
                    }`}>
                      {formData.role === 'BORROWER' && <CheckCircle className="h-5 w-5 text-white" />}
                    </div>
                    <span className="font-semibold block">Borrow Money</span>
                  </div>
                </label>
                <label className="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="LENDER"
                    checked={formData.role === 'LENDER'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-xl text-center transition-all duration-200 hover:shadow-lg ${
                    formData.role === 'LENDER'
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  }`}>
                    <div className={`h-8 w-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      formData.role === 'LENDER' ? 'bg-primary-600' : 'bg-gray-200'
                    }`}>
                      {formData.role === 'LENDER' && <CheckCircle className="h-5 w-5 text-white" />}
                    </div>
                    <span className="font-semibold block">Lend Money</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="input-icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="input-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${
                    !passwordMatch && formData.confirmPassword
                      ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500'
                      : ''
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!passwordMatch && formData.confirmPassword && (
                <p className="mt-2 text-sm text-danger-600 font-medium">Passwords do not match</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !passwordMatch}
                className="btn btn-primary w-full py-3 text-base"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="btn btn-secondary w-full py-3 text-base"
              >
                Sign in to existing account
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;