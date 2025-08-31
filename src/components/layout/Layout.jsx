import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow flex items-center px-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
