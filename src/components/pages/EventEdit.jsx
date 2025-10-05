import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditEvent = () => {
  const { id } = useParams();
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    description: '',
    category: 'personal',
    excelFile: null,
    fileName: ''
  });

  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingFile, setExistingFile] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
     
        const response = await axios.get(`http://localhost:5000/api/events/eventdetails/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const event = response.data.event;
        setFormData({
          name: event.eventName,
          date: event.eventDate.split('T')[0], // Format date for input
          time: event.eventTime,
          endTime: event.eventEndTime || '',
          location: event.location,
          description: event.description,
          category: event.category,
          excelFile: null,
          fileName: ''
        });
        
        if (response.data.fileName) {
          setExistingFile(response.data.fileName);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event data');
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setUploadStatus('error');
        toast.error('Please upload a valid Excel file (.xlsx, .xls, or .csv)');
        return;
      }

      setFormData(prev => ({
        ...prev,
        excelFile: file,
        fileName: file.name
      }));
      setUploadStatus('success');
      toast.success('Excel file uploaded successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that end time is after start time
    if (formData.endTime && formData.time && formData.endTime <= formData.time) {
      toast.error('End time must be after start time');
      return;
    }
    
    if (!formData.excelFile && !existingFile) {
      toast.error('Please upload an Excel file with guest data');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      data.append("name", formData.name);
      data.append("date", formData.date);
      data.append("time", formData.time);
      data.append("endTime", formData.endTime);
      data.append("location", formData.location);
      data.append("description", formData.description);
      data.append("category", formData.category);
      
      if (formData.excelFile) {
        data.append("excelFile", formData.excelFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/events/update/${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message || 'Event updated successfully!');
      
      setTimeout(() => {
        navigate(`/viewevents/${id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating event");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-8 relative">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {/* Spinner Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-700">Updating your event...</p>
            </div>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Edit Event</h1>
            <p className="text-gray-600">Update your event details below</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Event Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event name"
                  />
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event location"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Excel File Upload */}
                <div className="md:col-span-2">
                  <label htmlFor="excelFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Guest List (Excel File) {!existingFile && '*'}
                  </label>
                  <div className="flex flex-col items-start space-y-3">
                    <label htmlFor="excelFile" className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition duration-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {existingFile ? 'Update Excel File' : 'Upload Excel File'}
                    </label>
                    <input
                      type="file"
                      id="excelFile"
                      name="excelFile"
                      onChange={handleExcelChange}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                    />
                    
                    {existingFile && !formData.fileName && (
                      <div className="p-3 rounded-lg w-full bg-blue-50 text-blue-700 border border-blue-200">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-medium">Current file: {existingFile}</span>
                        </div>
                        <p className="text-sm mt-1">
                          Upload a new file only if you want to replace the existing guest list.
                        </p>
                      </div>
                    )}
                    
                    {formData.fileName && (
                      <div className={`p-3 rounded-lg w-full ${uploadStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700'}`}>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-medium">{formData.fileName}</span>
                        </div>
                        <p className="text-sm mt-1">
                          {uploadStatus === 'success' 
                            ? 'File successfully uploaded. This will replace your existing guest list.'
                            : 'Please upload an Excel file with your guest list.'}
                        </p>
                      </div>
                    )}
                    
                    {!formData.fileName && !existingFile && (
                      <p className="text-sm text-gray-500">
                        Upload an Excel file (.xlsx, .xls) or CSV containing your guest list
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your event..."
                  ></textarea>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/events/${id}`)}
                  className="w-full md:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full md:w-auto px-6 py-3 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition duration-300 flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 极速快3 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 极速快3a1 1 0 012 0v2H9V4z" />
                      </svg>
                      Update Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Fields marked with * are required</p>
            <p className="mt-1">Your Excel file should include guest names, emails, and any other relevant information</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditEvent;