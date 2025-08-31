import React from "react";
import Layout from "../layout/Layout";

const CreateTemplate = () => {
  return (
    <Layout>
        <div className="flex h-screen p-4 gap-4">
      {/* Sidebar Tools */}
      <div className="w-64 bg-gray-100 p-4 rounded shadow">
        <h2 className="font-bold mb-4">Tools</h2>
        <button className="w-full mb-2 bg-blue-500 text-white py-1 rounded">Add Text</button>
        <button className="w-full mb-2 bg-green-500 text-white py-1 rounded">Add Image</button>
        <button className="w-full mb-2 bg-purple-500 text-white py-1 rounded">Background</button>
        <button className="w-full mb-2 bg-yellow-500 text-white py-1 rounded">Add Sticker</button>
        <button className="w-full mb-2 bg-pink-500 text-white py-1 rounded">Shapes/Lines</button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-white rounded shadow relative flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">Your Template Canvas</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save Template</button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">
            Canvas area: Drag and drop elements here
          </p>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default CreateTemplate;
