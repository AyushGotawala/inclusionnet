import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, TrendingUp, CheckCircle, Star, MessageSquare, Zap, Lock, BarChart3, Handshake, Award, Clock } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center group transition-all duration-300 hover:scale-105">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                InclusionNet
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 via-accent-600/5 to-primary-600/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-semibold mb-6 animate-fadeIn">
              <Zap className="h-4 w-4 mr-2" />
              Trusted by thousands of users
            </div>
            <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl animate-slide-in-up">
              <span className="block">Peer-to-Peer</span>
              <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Lending Made Simple
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 md:text-2xl animate-fadeIn animate-delay-200">
              Connect directly with lenders and borrowers. Skip traditional banks and get better rates through our secure, verified platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn animate-delay-300">
              <Link
                to="/signup"
                className="group w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Start Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="#how-it-works"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 bg-white hover:bg-primary-50 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center animate-fadeIn animate-delay-400">
                <div className="text-4xl font-bold text-primary-600">10K+</div>
                <div className="text-gray-600 mt-2">Active Users</div>
              </div>
              <div className="text-center animate-fadeIn animate-delay-500">
                <div className="text-4xl font-bold text-primary-600">₹50Cr+</div>
                <div className="text-gray-600 mt-2">Loans Disbursed</div>
              </div>
              <div className="text-center animate-fadeIn animate-delay-600">
                <div className="text-4xl font-bold text-primary-600">4.8★</div>
                <div className="text-gray-600 mt-2">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Why Choose <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">InclusionNet</span>?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Revolutionary peer-to-peer lending platform designed for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group card p-8 text-center hover-lift">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Secure & Verified</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                All users go through comprehensive KYC verification to ensure platform security and trust.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group card p-8 text-center hover-lift">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-success-500 to-success-600 text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Better Rates</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Get competitive interest rates by cutting out traditional banking intermediaries.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group card p-8 text-center hover-lift">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Direct Connection</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Connect directly with borrowers and lenders without unnecessary middlemen.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group card p-8 text-center hover-lift">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-warning-500 to-warning-600 text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Fast Processing</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Quick loan approvals and instant fund transfers with our streamlined process.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group card p-8 text-center hover-lift">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Transparent Analytics</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Real-time insights and analytics to make informed lending and borrowing decisions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group card p-8 text-center hover-lift">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-success-500 to-primary-500 text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Handshake className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Trusted Platform</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Built with security and compliance at its core, ensuring safe transactions for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              How <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">InclusionNet</span> Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Simple, transparent, and secure lending process
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* For Borrowers */}
            <div className="card p-8 hover-lift">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Borrowers</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Sign Up & Verify', desc: 'Complete your profile and KYC verification' },
                  { step: '2', title: 'Create Loan Request', desc: 'Specify loan amount, purpose, and repayment terms' },
                  { step: '3', title: 'Get Matched', desc: 'Connect with interested lenders on our platform' },
                  { step: '4', title: 'Receive Funds', desc: 'Get your loan approved and funds transferred' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start group">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-primary-700 font-bold">{item.step}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Lenders */}
            <div className="card p-8 hover-lift">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Lenders</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Register & Verify', desc: 'Complete registration and identity verification' },
                  { step: '2', title: 'Browse Opportunities', desc: 'Review verified borrower profiles and loan requests' },
                  { step: '3', title: 'Choose Investment', desc: 'Select loans that match your risk and return preferences' },
                  { step: '4', title: 'Earn Returns', desc: 'Receive regular repayments with competitive interest' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start group">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-success-700 font-bold">{item.step}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              What Our <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Users</span> Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">Join thousands of satisfied users</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              { 
                stars: 5, 
                text: "InclusionNet helped me get a personal loan for my business at much better rates than traditional banks. The process was transparent and quick!", 
                author: "Sarah K.", 
                role: "Borrower",
                gradient: "from-primary-500 to-primary-600"
              },
              { 
                stars: 5, 
                text: "As a lender, I love the higher returns compared to traditional savings. The verification process gives me confidence in the borrowers.", 
                author: "Michael R.", 
                role: "Lender",
                gradient: "from-success-500 to-success-600"
              },
              { 
                stars: 5, 
                text: "The platform is secure, user-friendly, and the customer support team is always helpful. Highly recommend!", 
                author: "Jennifer L.", 
                role: "User",
                gradient: "from-accent-500 to-accent-600"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="card p-8 hover-lift">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="flex-1">
              <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                <span className="block">Ready to get started?</span>
                <span className="block text-primary-100 mt-2">Join thousands of users today.</span>
              </h2>
              <p className="mt-4 text-xl text-primary-100">
                Start your financial journey with InclusionNet today
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:mt-0 lg:flex-shrink-0">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-semibold rounded-xl text-primary-600 bg-white hover:bg-primary-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-semibold rounded-xl text-white bg-transparent hover:bg-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">InclusionNet</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Making financial inclusion accessible for everyone. Connect, lend, and borrow with confidence.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 InclusionNet. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;