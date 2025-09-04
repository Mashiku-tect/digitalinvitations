import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

// Map routes to page titles
const routeTitles = {
  "/dashboard": "Dashboard",
  "/events": "All Events",
  "/events/create": "Create Event",
  "/invitations/generate": "Generate Invitation Card",
  "/invitations/send": "Send Invitations",
  "/invitations/status": "Invitations Status",
    "/qr/logs": "QR Code Check-In Logs",
  "/reports/events": "Event Reports",
  "/users": "All Users",
  "/users/add": "Add User",
  "/users/roles": "Roles & Permissions",
  "/events/:id": "Event Details",
  "/events/:id/edit": "Edit Event",
  


  "/": "Dashboard" // fallback for root
};

const Layout = ({ children }) => {
  const location = useLocation();

  // Get the title based on current route path
  const pageTitle = routeTitles[location.pathname] || "Page";

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow flex items-center px-4">
          <h1 className="text-xl font-bold">{pageTitle}</h1>
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
