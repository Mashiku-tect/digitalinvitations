import React from "react";
import { Link,useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import { usePermissions } from '../../context/PermissionContext';
import { getFirstAllowedRoute } from "../../utils/PermissionRouteCheckHelper";

const  Forbidden=()=> {
  const navigate=useNavigate();
  const { permissions } = usePermissions();
    const handleGoHome = () => {
      const route = getFirstAllowedRoute(permissions);
  
      //alert(route);
      navigate(route);
    };
  return (
   <Layout>
     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 via-white to-pink-100 text-gray-800 p-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-red-500 mb-4">403</h1>
        <h2 className="text-3xl font-bold mb-6">No Trespassing Beyond This Line</h2>

        <p className="text-lg text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
          You knocked on a secret door,<br />
          but this realm’s not yours to explore.<br />
          Maybe ask the admin with care,<br />
          or head back home — there’s fun elsewhere! 
        </p>

         <button
          onClick={handleGoHome}
          className="bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium shadow-md hover:bg-red-600 transition"
        >
        Take Me Home
        </button>

        <div className="mt-10 text-sm text-gray-500 italic">
          “Permission is power… and yours isn’t granted yet.”
        </div>
      </div>
    </div>
   </Layout>
  );
}


export default Forbidden;