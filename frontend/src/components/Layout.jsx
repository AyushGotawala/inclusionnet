import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import { TrendingUp, LogOut, User, Settings, Bell } from 'lucide-react';

const Layout = ({ children, title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">InclusionNet</span>
              </Link>
              {title && (
                <span className="ml-4 text-gray-400">|</span>
              )}
              {title && (
                <h1 className="ml-4 text-xl font-semibold text-gray-900">{title}</h1>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
                
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <User className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;