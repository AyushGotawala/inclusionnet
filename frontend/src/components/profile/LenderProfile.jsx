import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../Layout';
import { User, Edit2, Save, X, Phone, Mail, FileText, DollarSign, TrendingUp, Target, PieChart } from 'lucide-react';

const LenderProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
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
    available_funds: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/kyc/lenders/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          full_name: data.full_name || '',
          age: data.age || '',
          gender: data.gender || '',
          contact_number: data.contact_number || '',
          email: data.email || '',
          aadhaar_number: data.aadhar_number || '',
          pan_number: data.pan_number || '',
          investment_experience: data.investment_experience || '',
          investment_amount: data.investment_amount || '',
          risk_tolerance: data.risk_tolerance || '',
          preferred_loan_duration: data.preferred_loan_duration || '',
          income_source: data.income_source || '',
          annual_income: data.annual_income || '',
          investment_goals: data.investment_goals || '',
          available_funds: data.available_funds || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/kyc/lenders/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        age: profileData.age || '',
        gender: profileData.gender || '',
        contact_number: profileData.contact_number || '',
        email: profileData.email || '',
        aadhaar_number: profileData.aadhar_number || '',
        pan_number: profileData.pan_number || '',
        investment_experience: profileData.investment_experience || '',
        investment_amount: profileData.investment_amount || '',
        risk_tolerance: profileData.risk_tolerance || '',
        preferred_loan_duration: profileData.preferred_loan_duration || '',
        income_source: profileData.income_source || '',
        annual_income: profileData.annual_income || '',
        investment_goals: profileData.investment_goals || '',
        available_funds: profileData.available_funds || '',
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Lender Profile</h1>
                  <p className="text-gray-600">Manage your investment preferences and information</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.full_name || 'Not provided'}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{formData.age || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-gray-900">{formData.gender || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Contact Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.contact_number || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.email || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Identity Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                Identity Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="aadhaar_number"
                      value={formData.aadhaar_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.aadhaar_number || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="pan_number"
                      value={formData.pan_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="ABCDE1234F"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.pan_number || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
                Investment Preferences
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Investment Experience</label>
                  {isEditing ? (
                    <select
                      name="investment_experience"
                      value={formData.investment_experience}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Experience Level</option>
                      <option value="beginner">Beginner (0-1 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="experienced">Experienced (5+ years)</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.investment_experience || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Available Investment Amount (₹)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="available_funds"
                      value={formData.available_funds}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">₹{formData.available_funds ? Number(formData.available_funds).toLocaleString() : 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Risk Tolerance
                  </label>
                  {isEditing ? (
                    <select
                      name="risk_tolerance"
                      value={formData.risk_tolerance}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Risk Tolerance</option>
                      <option value="conservative">Conservative (Low Risk)</option>
                      <option value="moderate">Moderate (Medium Risk)</option>
                      <option value="aggressive">Aggressive (High Risk)</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.risk_tolerance || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Loan Duration</label>
                  {isEditing ? (
                    <select
                      name="preferred_loan_duration"
                      value={formData.preferred_loan_duration}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Duration</option>
                      <option value="short_term">Short Term (1-6 months)</option>
                      <option value="medium_term">Medium Term (6-24 months)</option>
                      <option value="long_term">Long Term (2+ years)</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.preferred_loan_duration || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="h-5 w-5 text-gray-500 mr-2" />
                Financial Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Income Source</label>
                  {isEditing ? (
                    <select
                      name="income_source"
                      value={formData.income_source}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Income Source</option>
                      <option value="salary">Salary</option>
                      <option value="business">Business</option>
                      <option value="investments">Investments</option>
                      <option value="pension">Pension</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.income_source || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Annual Income (₹)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="annual_income"
                      value={formData.annual_income}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">₹{formData.annual_income ? Number(formData.annual_income).toLocaleString() : 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Investment Goals</label>
                  {isEditing ? (
                    <textarea
                      name="investment_goals"
                      value={formData.investment_goals}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe your investment goals and objectives..."
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.investment_goals || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Investment Amount (₹)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="investment_amount"
                      value={formData.investment_amount}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">₹{formData.investment_amount ? Number(formData.investment_amount).toLocaleString() : 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LenderProfile;