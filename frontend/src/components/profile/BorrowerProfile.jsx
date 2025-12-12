import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../Layout';
import { User, Edit2, Save, X, Phone, Mail, FileText, Briefcase, Calendar, CreditCard, Camera, Upload } from 'lucide-react';

const BorrowerProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  
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
    current_outstanding_loan: '',
    average_emi_per_month: '',
    credit_card_repayment_behavior: '',
    approx_monthly_expenses: '',
    maintains_savings_monthly: false,
    pays_bills: false,
  });

  useEffect(() => {
    fetchProfile();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.profilePicture) {
          setProfilePictureUrl(data.data.profilePicture);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/kyc/borrowers/profile', {
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
          aadhaar_number: data.aadhaar_number || '',
          pan_number: data.pan_number || '',
          employment_type: data.employment_type || '',
          monthly_income: data.monthly_income || '',
          years_of_job_stability: data.years_of_job_stability || '',
          current_outstanding_loan: data.current_outstanding_loan || '',
          average_emi_per_month: data.average_emi_per_month || '',
          credit_card_repayment_behavior: data.credit_card_repayment_behavior || '',
          approx_monthly_expenses: data.approx_monthly_expenses || '',
          maintains_savings_monthly: data.maintains_savings_monthly || false,
          pays_bills: data.pays_bills || false,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/kyc/borrowers/profile', {
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
    setProfilePicturePreview(null);
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        age: profileData.age || '',
        gender: profileData.gender || '',
        contact_number: profileData.contact_number || '',
        email: profileData.email || '',
        aadhaar_number: profileData.aadhaar_number || '',
        pan_number: profileData.pan_number || '',
        employment_type: profileData.employment_type || '',
        monthly_income: profileData.monthly_income || '',
        years_of_job_stability: profileData.years_of_job_stability || '',
        current_outstanding_loan: profileData.current_outstanding_loan || '',
        average_emi_per_month: profileData.average_emi_per_month || '',
        credit_card_repayment_behavior: profileData.credit_card_repayment_behavior || '',
        approx_monthly_expenses: profileData.approx_monthly_expenses || '',
        maintains_savings_monthly: profileData.maintains_savings_monthly || false,
        pays_bills: profileData.pays_bills || false,
      });
    }
  };

  const handleProfilePictureChange = (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.match('image.*')) {
          alert('Please select an image file');
          return;
        }
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }
        // Store file for upload
        setProfilePictureFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePicturePreview(reader.result);
        };
        reader.onerror = () => {
          console.error('Error reading file');
          alert('Error reading file. Please try again.');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling profile picture change:', error);
      alert('Error selecting file. Please try again.');
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePictureFile) return;

    try {
      setUploadingPicture(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePicture', profilePictureFile);

      const response = await fetch('http://localhost:4000/api/user/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePictureUrl(data.data.profilePicture);
        setProfilePicturePreview(null);
        setProfilePictureFile(null);
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          user.profilePicture = data.data.profilePicture;
          localStorage.setItem('user', JSON.stringify(user));
        }
        alert('Profile picture uploaded successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Error uploading profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (profilePicturePreview) {
      return profilePicturePreview;
    }
    if (profilePictureUrl) {
      if (profilePictureUrl.startsWith('http')) {
        return profilePictureUrl;
      }
      return `http://localhost:4000${profilePictureUrl}`;
    }
    return null;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {getProfilePictureUrl() ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Borrower Profile</h1>
                  <p className="text-gray-600">Manage your borrower information and preferences</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {profilePictureFile && (
                  <button
                    onClick={handleUploadProfilePicture}
                    disabled={uploadingPicture}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPicture ? 'Uploading...' : 'Upload Picture'}
                  </button>
                )}
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
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ABCDE1234F"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.pan_number || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                Employment Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                  {isEditing ? (
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Employment Type</option>
                      <option value="salaried">Salaried</option>
                      <option value="self_employed">Self Employed</option>
                      <option value="business_owner">Business Owner</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="unemployed">Unemployed</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.employment_type || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="text-sm font-bold mr-1">₹</span>
                    Monthly Income (₹)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="monthly_income"
                      value={formData.monthly_income}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">₹{formData.monthly_income ? Number(formData.monthly_income).toLocaleString() : 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Years of Job Stability
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="years_of_job_stability"
                      value={formData.years_of_job_stability}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.years_of_job_stability || 'Not provided'} years</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                Financial Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Outstanding Loan (₹)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="current_outstanding_loan"
                      value={formData.current_outstanding_loan}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">₹{formData.current_outstanding_loan ? Number(formData.current_outstanding_loan).toLocaleString() : 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Average EMI per Month (₹)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="average_emi_per_month"
                      value={formData.average_emi_per_month}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">₹{formData.average_emi_per_month ? Number(formData.average_emi_per_month).toLocaleString() : 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Expenses (₹)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="approx_monthly_expenses"
                      value={formData.approx_monthly_expenses}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">₹{formData.approx_monthly_expenses ? Number(formData.approx_monthly_expenses).toLocaleString() : 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credit Card Repayment Behavior</label>
                  {isEditing ? (
                    <select
                      name="credit_card_repayment_behavior"
                      value={formData.credit_card_repayment_behavior}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Behavior</option>
                      <option value="always_full">Always pay full amount</option>
                      <option value="minimum">Pay minimum amount</option>
                      <option value="partial">Pay partial amount</option>
                      <option value="no_credit_card">No credit card</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.credit_card_repayment_behavior || 'Not provided'}</p>
                  )}
                </div>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="maintains_savings_monthly"
                        checked={formData.maintains_savings_monthly}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    ) : (
                      <div className={`h-4 w-4 rounded border-2 ${formData.maintains_savings_monthly ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} mr-2`}>
                        {formData.maintains_savings_monthly && (
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                    <span className="ml-2 text-sm text-gray-700">Maintains monthly savings</span>
                  </label>
                  <label className="flex items-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="pays_bills"
                        checked={formData.pays_bills}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    ) : (
                      <div className={`h-4 w-4 rounded border-2 ${formData.pays_bills ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} mr-2`}>
                        {formData.pays_bills && (
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                    <span className="ml-2 text-sm text-gray-700">Pays bills on time</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BorrowerProfile;