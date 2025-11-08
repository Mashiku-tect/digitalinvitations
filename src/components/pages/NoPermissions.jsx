import React from "react";
import { LogOut, ShieldAlert, Mail, RefreshCw } from "lucide-react";
import Layout from "../layout/Layout";

const NoPermissionsPage = () => {
  const handleContactAdmin = () => {
    // Implement contact logic here
    console.log("Contact admin clicked");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logout clicked");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4 sm:px-6 py-8">
        {/* Main Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">!</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Access Pending Approval
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Your account is currently awaiting permissions. Please contact your 
              system administrator to get access to the platform features.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium text-amber-800">
                Awaiting Permissions
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3">
            
            <button
              onClick={handleRefresh}
              className="w-full sm:flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          
        </div>

        

        {/* Footer */}
        <footer className="mt-8 text-gray-400 text-xs text-center">
          © {new Date().getFullYear()} Mashiku-Tech. All rights reserved.
        </footer>
      </div>
    </Layout>
  );
};

export default NoPermissionsPage;