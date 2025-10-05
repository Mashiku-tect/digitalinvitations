import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  Send,
  QrCode,
  Brush,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  //const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  

  useEffect(() => {
  if (window.innerWidth < 768) { // Tailwind md breakpoint
    setIsExpanded(false);
  }
}, []);

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      title: "Events",
      icon: <CalendarDays size={20} />,
      children: [
        { title: "All Events", path: "/events" },
        { title: "Create Event", path: "/events/create" },
        
      ],
    },
    {
      title: "Invitations",
      icon: <Send size={20} />,
      children: [
        { title: "Generate Invitations", path: "/invitations/generate" },
      
        { title: "Send Invitations", path: "/invitations/send" },
       
      ],
    },
    {
      title: "QR Check-in",
      icon: <QrCode size={20} />,
      children: [
        // { title: "Live Scan", path: "/qr/live" },
        { title: "Check-in Logs", path: "/qr/logs" },
        
      ],
    },
    {
      title: "Users",
      icon: <Users size={20} />,
      children: [
        { title: "All Users", path: "/users" },
        { title: "Add User", path: "/users/add" },
        { title: "Roles & Permissions", path: "/users/roles" },
      ],
    },
    
    {
      title: "Logout",
      icon: <LogOut size={20} />,
      path: "/logout",
    },
  ];

  return (
   <div
  className={`h-screen bg-gray-900 text-white transition-all duration-300 fixed md:relative top-0 left-0 z-20
    ${isExpanded 
      ? "w-64 translate-x-0" 
      : "w-15 md:w-15 md:translate-x-0 -translate-x-full"
    }`}
>

      <div className="p-4 flex justify-between items-center">
        <span className={`font-bold text-lg ${!isExpanded && "hidden"}`}>
          Mashiku_Tech
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded hover:bg-gray-700"
        >
          <ChevronRight
            className={`transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <nav className="mt-6">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="relative group"
            onMouseEnter={() => setHoveredItem(item.title)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {item.path ? (
              <Link
                to={item.path}
                className="flex items-center w-full px-4 py-3 hover:bg-gray-800"
              >
                <span className="mr-3">{item.icon}</span>
                {isExpanded && <span>{item.title}</span>}
              </Link>
            ) : (
              <button className="flex items-center w-full px-4 py-3 hover:bg-gray-800">
                <span className="mr-3">{item.icon}</span>
                {isExpanded && <span>{item.title}</span>}
              </button>
            )}

            {/* Expanded sidebar submenu */}
            {isExpanded && item.children && hoveredItem === item.title && (
              <div className="ml-10 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[200px] z-50 absolute top-full left-0 border border-gray-700">
                {item.children.map((child, i) => (
                  <Link
                    to={child.path}
                    key={i}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Collapsed sidebar submenu */}
            {!isExpanded && hoveredItem === item.title && (
              <div className="absolute left-full top-0 ml-1 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[200px] z-[9999] border border-gray-700">
                {item.children ? (
                  item.children.map((child, i) => (
                    <Link
                      to={child.path}
                      key={i}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                    >
                      {child.title}
                    </Link>
                  ))
                ) : (
                  <span className="px-4 py-2 block">{item.title}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
