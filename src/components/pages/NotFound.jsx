import React from "react";
import { Link,useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import { usePermissions } from '../../context/PermissionContext';
import { getFirstAllowedRoute } from "../../utils/PermissionRouteCheckHelper";

const  NotFound=()=> {
  const navigate=useNavigate();

  //const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
  const { permissions } = usePermissions();
  //console.log('Permissions in NotFound:', permissions);

  const handleGoHome = () => {
    const route = getFirstAllowedRoute(permissions);

    //alert(route);
    navigate(route);
  };
  return (
    <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-100 via-white to-pink-100 text-gray-800 p-6">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-6">Lost in the Code Forest 🌲</h2>

        <p className="text-lg text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
          You wandered off the digital trail,<br />
          chasing URLs that sail and fail.<br />
          But don’t you worry, take a pause <br />
          even broken links deserve applause.<br />
          Let’s find our way back home, shall we?
        </p>

         <button
          onClick={handleGoHome}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full text-lg font-medium shadow-md hover:bg-red-600 transition"
        >
        Take Me Home
        </button>

        <div className="mt-10 text-sm text-gray-500 italic">
          “Not all who wander are lost... but this page sure is.”
        </div>
      </div>
    </div>
    </Layout>
  );
}

export default NotFound;
