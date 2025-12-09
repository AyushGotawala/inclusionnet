import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import { TrendingUp, LogOut, User, Settings, Bell, ChevronDown, Home, CreditCard, UserCheck, Menu, X } from 'lucide-react';

const Layout = ({ children, title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'BORROWER':
        return '/borrower-dashboard';
      case 'LENDER':
        return '/lender-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  const getProfileRoute = () => {
    switch (user?.role) {
      case 'BORROWER':
        return '/borrower-profile';
      case 'LENDER':
        return '/lender-profile';
      default:
        return '/';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'LENDER':
        return 'bg-green-100 text-green-800';
      case 'BORROWER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigationItems = [
    { label: 'Dashboard', route: getDashboardRoute(), icon: Home },
    ...(user?.role !== 'ADMIN' ? [{ label: 'Profile', route: getProfileRoute(), icon: User }] : []),
    ...(user?.role === 'BORROWER' ? [{ label: 'KYC', route: '/borrower-kyc', icon: UserCheck }] : []),
    ...(user?.role === 'LENDER' ? [{ label: 'KYC', route: '/lender-kyc', icon: UserCheck }] : []),
  ];

  const profileMenuItems = [
    { label: 'Edit Profile', route: getProfileRoute(), icon: User },
    { label: 'Reset Password', route: '/reset-password', icon: Settings },
    { label: 'Report Issue', route: '/report-issue', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group transition-all duration-300 hover:scale-105">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  InclusionNet
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.route}
                    className="group flex items-center text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-gray-100 transform hover:scale-105"
                  >
                    <IconComponent className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Role Badge (Desktop) */}
              {user && (
                <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)} animate-pulse`}>
                  {user.role}
                </span>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="group flex items-center text-gray-700 hover:text-gray-900 p-2 rounded-xl transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <span className="text-white text-sm sm:text-base font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 sm:w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-slideInDown">
                    {/* User Info (Mobile) */}
                    <div className="sm:hidden px-4 py-3 border-b border-gray-200">
                      <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mt-2 ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>

                    {/* Menu Items */}
                    {user?.role !== 'ADMIN' && profileMenuItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.route}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                        >
                          <IconComponent className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
                          {item.label}
                        </Link>
                      );
                    })}
                    
                    {/* Logout */}
                    <div className="border-t border-gray-200 mt-2">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="group flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-600" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 animate-slideInDown">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.route}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center text-gray-600 hover:text-gray-900 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-gray-100"
                    >
                      <IconComponent className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Overlay for mobile dropdowns */}
      {(isProfileDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 transition-opacity duration-300"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            transform: translateY(-10px);
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
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
        
        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default Layout;