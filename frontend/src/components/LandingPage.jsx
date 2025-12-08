import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, TrendingUp, CheckCircle, Star, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">InclusionNet</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Peer-to-Peer</span>
              <span className="block text-blue-600">Lending Made Simple</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect directly with lenders and borrowers. Skip traditional banks and get better rates through our secure, verified platform.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition duration-200"
                >
                  Start Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="#how-it-works"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose InclusionNet?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Revolutionary peer-to-peer lending platform designed for everyone
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Secure & Verified</h3>
                <p className="mt-2 text-base text-gray-500">
                  All users go through comprehensive KYC verification to ensure platform security and trust.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Better Rates</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get competitive interest rates by cutting out traditional banking intermediaries.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Direct Connection</h3>
                <p className="mt-2 text-base text-gray-500">
                  Connect directly with borrowers and lenders without unnecessary middlemen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How InclusionNet Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Simple, transparent, and secure lending process
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* For Borrowers */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">For Borrowers</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Sign Up & Verify</h4>
                      <p className="text-gray-500">Complete your profile and KYC verification</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Create Loan Request</h4>
                      <p className="text-gray-500">Specify loan amount, purpose, and repayment terms</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Get Matched</h4>
                      <p className="text-gray-500">Connect with interested lenders on our platform</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Receive Funds</h4>
                      <p className="text-gray-500">Get your loan approved and funds transferred</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Lenders */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">For Lenders</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Register & Verify</h4>
                      <p className="text-gray-500">Complete registration and identity verification</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Browse Opportunities</h4>
                      <p className="text-gray-500">Review verified borrower profiles and loan requests</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Choose Investment</h4>
                      <p className="text-gray-500">Select loans that match your risk and return preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Earn Returns</h4>
                      <p className="text-gray-500">Receive regular repayments with competitive interest</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "InclusionNet helped me get a personal loan for my business at much better rates than traditional banks. The process was transparent and quick!"
              </p>
              <p className="font-semibold text-gray-900">- Sarah K., Borrower</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "As a lender, I love the higher returns compared to traditional savings. The verification process gives me confidence in the borrowers."
              </p>
              <p className="font-semibold text-gray-900">- Michael R., Lender</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The platform is secure, user-friendly, and the customer support team is always helpful. Highly recommend!"
              </p>
              <p className="font-semibold text-gray-900">- Jennifer L., User</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-blue-200">Join thousands of users today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition duration-200"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400 transition duration-200"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-2xl font-bold text-white">InclusionNet</span>
            </div>
            <p className="mt-4 text-gray-400">
              Making financial inclusion accessible for everyone.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              © 2025 InclusionNet. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;