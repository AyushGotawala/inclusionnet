import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../Layout';
import { MessageSquare, Send, CheckCircle, AlertCircle, Bug, HelpCircle, Shield, CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    category: '',
    priority: 'medium',
    subject: '',
    description: '',
    steps: '',
    expectedBehavior: '',
    actualBehavior: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const issueCategories = [
    { value: 'technical', label: 'Technical Issue', icon: Bug, description: 'App bugs, errors, crashes' },
    { value: 'account', label: 'Account Problem', icon: Shield, description: 'Login, profile, security issues' },
    { value: 'payment', label: 'Payment Issue', icon: CreditCard, description: 'Transaction, billing problems' },
    { value: 'general', label: 'General Question', icon: HelpCircle, description: 'How-to, feature requests' },
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50 border-green-200', description: 'Minor issue, can wait' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', description: 'Normal issue' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200', description: 'Important issue' },
    { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200', description: 'System down or blocking' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    if (!formData.category) {
      setMessage({ type: 'error', text: 'Please select an issue category' });
      return false;
    }
    
    if (!formData.subject.trim()) {
      setMessage({ type: 'error', text: 'Please enter a subject' });
      return false;
    }
    
    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: 'Please describe the issue' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/support/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Issue reported successfully! Ticket ID: ${data.ticketId || 'N/A'}` 
        });
        setFormData({
          category: '',
          priority: 'medium',
          subject: '',
          description: '',
          steps: '',
          expectedBehavior: '',
          actualBehavior: '',
        });
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to submit issue report' });
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-4 sm:py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-all duration-300 transform hover:-translate-x-1"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-6 transform transition-all duration-500 hover:shadow-2xl">
            <div className="text-center">
              <div className="relative">
                <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-500 hover:scale-110 shadow-lg">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-blue-400 rounded-full border-4 border-white animate-pulse"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
              <p className="text-gray-600 text-sm sm:text-base">Help us improve by reporting bugs or asking questions</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 transform transition-all duration-500">
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-start animate-slideInDown ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm sm:text-base">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Issue Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {issueCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <label
                        key={category.value}
                        className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          formData.category === category.value
                            ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={formData.category === category.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-center mb-2">
                          <IconComponent className={`h-5 w-5 mr-3 ${
                            formData.category === category.value ? 'text-orange-600' : 'text-gray-600'
                          }`} />
                          <span className="text-sm font-semibold text-gray-900">{category.label}</span>
                        </div>
                        <span className="text-xs text-gray-500">{category.description}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Priority Level */}
              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {priorityLevels.map((priority) => (
                    <label
                      key={priority.value}
                      className={`relative flex flex-col p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        formData.priority === priority.value
                          ? `${priority.color} border-current shadow-lg scale-105`
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-semibold text-gray-900 mb-1">{priority.label}</span>
                      <span className="text-xs text-gray-500">{priority.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="group">
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base group-hover:border-gray-400"
                  placeholder="Brief summary of the issue"
                />
              </div>

              {/* Description */}
              <div className="group">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base group-hover:border-gray-400 resize-vertical"
                  placeholder="Detailed description of the issue you're experiencing"
                />
              </div>

              {/* Technical Issue Fields */}
              {formData.category === 'technical' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="group">
                    <label htmlFor="steps" className="block text-sm font-semibold text-gray-700 mb-2">
                      Steps to Reproduce
                    </label>
                    <textarea
                      id="steps"
                      name="steps"
                      value={formData.steps}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base group-hover:border-gray-400 resize-vertical"
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. Notice that..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label htmlFor="expectedBehavior" className="block text-sm font-semibold text-gray-700 mb-2">
                        Expected Behavior
                      </label>
                      <textarea
                        id="expectedBehavior"
                        name="expectedBehavior"
                        value={formData.expectedBehavior}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base group-hover:border-gray-400 resize-vertical"
                        placeholder="What should happen?"
                      />
                    </div>
                    <div className="group">
                      <label htmlFor="actualBehavior" className="block text-sm font-semibold text-gray-700 mb-2">
                        Actual Behavior
                      </label>
                      <textarea
                        id="actualBehavior"
                        name="actualBehavior"
                        value={formData.actualBehavior}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base group-hover:border-gray-400 resize-vertical"
                        placeholder="What actually happened?"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Issue...
                  </div>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2 inline" />
                    Submit Issue Report
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mt-6 transform transition-all duration-500 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Before Submitting
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">For Technical Issues:</h4>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Try refreshing the page first</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Clear your browser cache</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Try a different browser</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Check your internet connection</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Response Time:</h4>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Critical: Within 1 hour</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>High: Within 4 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Medium: Within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Low: Within 48 hours</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </Layout>
  );
};

export default ReportIssue;