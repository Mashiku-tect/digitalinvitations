import React from "react";
import Layout from "../layout/Layout";

// Dummy template data
const templates = [
  { id: 1, name: "Birthday Bash", occasion: "Birthday", thumbnail: "/images/template1.jpg" },
  { id: 2, name: "Wedding Bliss", occasion: "Wedding", thumbnail: "/images/template2.jpg" },
  { id: 3, name: "Conference Invite", occasion: "Conference", thumbnail: "/images/template3.jpg" },
  { id: 4, name: "Graduation Party", occasion: "Graduation", thumbnail: "/images/template4.jpg" },
];

const CardTemplates = () => {
  return (
  <Layout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Card Templates</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create New Template
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="relative bg-white shadow rounded overflow-hidden hover:shadow-lg">
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="font-semibold">{template.name}</h2>
              <p className="text-gray-500 text-sm">{template.occasion}</p>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4 opacity-0 hover:opacity-100 transition">
              <button className="bg-white px-3 py-1 rounded">Preview</button>
              <button className="bg-blue-500 text-white px-3 py-1 rounded">Use Template</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Layout>
  );
};

export default CardTemplates;
