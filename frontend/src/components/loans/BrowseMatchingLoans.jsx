import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layout';
import MatchingLoans from './MatchingLoans';
import { ArrowLeft } from 'lucide-react';

const BrowseMatchingLoans = () => {
  return (
    <Layout title="Browse Matching Loans">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/lender-dashboard"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Browse Matching Loans</h1>
            <p className="text-gray-600 mt-2">
              Find loan applications that match your available funds and investment preferences
            </p>
          </div>
        </div>

        {/* Matching Loans Component */}
        <MatchingLoans />
      </div>
    </Layout>
  );
};

export default BrowseMatchingLoans;
