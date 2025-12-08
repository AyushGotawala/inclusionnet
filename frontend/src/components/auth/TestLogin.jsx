import React from 'react';

const TestLogin = () => {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Login Page</h1>
        <p className="text-gray-600">This is a test login page to check if routing works.</p>
        <form className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestLogin;