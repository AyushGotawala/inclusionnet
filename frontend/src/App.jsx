import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { checkAuthStatus } from '@/store/slices/authSlice';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import TestLogin from './components/auth/TestLogin';
import SimpleLogin from './components/auth/SimpleLogin';
import Signup from './components/auth/Signup';
import BorrowerDashboard from './components/dashboards/BorrowerDashboard';
import LenderDashboard from './components/dashboards/LenderDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import BorrowerKYC from './components/kyc/BorrowerKYC';
import LenderKYC from './components/kyc/LenderKYC';
import BorrowerProfile from './components/profile/BorrowerProfile';
import LenderProfile from './components/profile/LenderProfile';
import ResetPassword from './components/profile/ResetPassword';
import ReportIssue from './components/profile/ReportIssue';
import LoanApplication from './components/loans/LoanApplication';
import MyLoans from './components/loans/MyLoans';
import ViewMatchingLenders from './components/loans/ViewMatchingLenders';
import BrowseMatchingLoans from './components/loans/BrowseMatchingLoans';
import BorrowerProfileForLender from './components/profile/BorrowerProfileForLender';
import ChatInterface from './components/chat/ChatInterface';
import LoanRequests from './components/requests/LoanRequests';
import Messages from './components/messages/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'BORROWER':
        return '/borrower-dashboard';
      case 'LENDER':
        return '/lender-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Router>
      <div className="App w-full min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Login />} 
          />
          <Route 
            path="/test-login" 
            element={<TestLogin />} 
          />
          <Route 
            path="/simple-login" 
            element={<SimpleLogin />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Signup />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/borrower-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER']}>
                <BorrowerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lender-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['LENDER']}>
                <LenderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/borrower-kyc" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER']}>
                <BorrowerKYC />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lender-kyc" 
            element={
              <ProtectedRoute allowedRoles={['LENDER']}>
                <LenderKYC />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/borrower-profile" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER']}>
                <BorrowerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lender-profile" 
            element={
              <ProtectedRoute allowedRoles={['LENDER']}>
                <LenderProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER', 'LENDER', 'ADMIN']}>
                <ResetPassword />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report-issue" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER', 'LENDER', 'ADMIN']}>
                <ReportIssue />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apply-loan" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER']}>
                <LoanApplication />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-loans" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER']}>
                <MyLoans />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-loans/:loanApplicationId/matching-lenders" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER']}>
                <ViewMatchingLenders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/browse-matching-loans" 
            element={
              <ProtectedRoute allowedRoles={['LENDER']}>
                <BrowseMatchingLoans />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/borrowers/:borrowerId/profile" 
            element={
              <ProtectedRoute allowedRoles={['LENDER']}>
                <BorrowerProfileForLender />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat/:loanRequestId" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER', 'LENDER']}>
                <ChatInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/loan-requests" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER', 'LENDER']}>
                <LoanRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER', 'LENDER']}>
                <Messages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages/:loanRequestId" 
            element={
              <ProtectedRoute allowedRoles={['BORROWER', 'LENDER']}>
                <Messages />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
