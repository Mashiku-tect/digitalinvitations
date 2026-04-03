import React from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";

const Unauthorized=()=> {
  return (
   <Layout>
     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 via-white to-orange-100 text-gray-800 p-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-orange-500 mb-4">401</h1>
        <h2 className="text-3xl font-bold mb-6">Hold up, Traveler! </h2>

        <p className="text-lg text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
          You’ve reached a gate with no key,<br />
          a digital lock — no entry, you see. <br />
          Log in, gear up, and try again,<br />
          then you may pass this cyber domain. 
        </p>

        <Link
          to="/"
          className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full text-lg font-medium shadow-md hover:bg-orange-600 transition"
        >
          🔑 Log In
        </Link>

        <div className="mt-10 text-sm text-gray-500 italic">
          “Access denied, but courage supplied.”
        </div>
      </div>
    </div>
   </Layout>
  );
}


export default Unauthorized;