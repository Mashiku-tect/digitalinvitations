import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../../utils/api";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    endDate: '',
    time: '',
    endTime: '',
    location: '',
    locationUrl: '',
    description: '',
    category: 'personal',
    package: 'Basic',
    excelFile: null,
    fileName: ''
  });

  const [errors, setErrors] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    document.title = "Create Event - eCards";
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions for name (event name)
    if (name === 'name') {
      // Allow letters, spaces, numbers, and '&' only
      const allowedChars = value.replace(/[^a-zA-Z0-9\s&]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: allowedChars
      }));
    }
    // Apply input restrictions for location
    else if (name === 'location') {
      // Allow letters, spaces, and comma only
      const allowedChars = value.replace(/[^a-zA-Z0-9\s,]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: allowedChars
      }));
    }
    // Apply input restrictions for description
    else if (name === 'description') {
      // Allow letters, spaces, numbers, and '&' only
      const allowedChars = value.replace(/[^a-zA-Z0-9\s&]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: allowedChars
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (name === 'date' && !formData.endDate) {
      setFormData(prev => ({
        ...prev,
        endDate: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
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

  const validateForm = () => {
    const newErrors = {};
    
    // Event Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    } else if (!/^[a-zA-Z0-9\s&]+$/.test(formData.name)) {
      newErrors.name = 'Event name can only contain letters, numbers, spaces, and & symbol';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Event name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Event name cannot exceed 100 characters';
    }
    
    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (!/^[a-zA-Z0-9\s,]+$/.test(formData.location)) {
      newErrors.location = 'Location can only contain letters, numbers, spaces, and commas';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    } else if (formData.location.trim().length > 200) {
      newErrors.location = 'Location cannot exceed 200 characters';
    }

    // Location URL validation
    if (
      formData.locationUrl.trim() &&
      !/^https?:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(formData.locationUrl.trim())
    ) {
      newErrors.locationUrl = 'Please enter a valid Google Maps URL';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (!/^[a-zA-Z0-9\s&]+$/.test(formData.description)) {
      newErrors.description = 'Description can only contain letters, numbers, spaces, and & symbol';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    // Date validations
    if (!formData.date) {
      newErrors.date = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    // Time validations
    if (!formData.time) {
      newErrors.time = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Package validation
    if (!formData.package) {
      newErrors.package = 'Package type is required';
    }
    
    // Excel file validation
    if (!formData.excelFile) {
      newErrors.excelFile = 'Excel file is required';
    }
    
    setErrors(newErrors);
    
    // If there are errors, don't proceed with time validation
    if (Object.keys(newErrors).length > 0) {
      return false;
    }
    
    // Validate event times
    const timeValidation = validateEventTimes();
    if (!timeValidation.isValid) {
      toast.error(timeValidation.message);
      return false;
    }
    
    return true;
  };

  const validateEventTimes = () => {
    if (!formData.date || !formData.endDate || !formData.time || !formData.endTime) {
      return { isValid: false, message: 'Please fill in all date and time fields' };
    }

    const startDateTime = new Date(`${formData.date}T${formData.time}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      return { 
        isValid: false, 
        message: 'End date and time must be after start date and time' 
      };
    }

    const durationInDays = (endDateTime - startDateTime) / (1000 * 60 * 60 * 24);
    if (durationInDays > 30) {
      return { 
        isValid: false, 
        message: 'Event duration cannot exceed 30 days' 
      };
    }

    const now = new Date();
    if (startDateTime < now) {
      return { 
        isValid: false, 
        message: 'Event start time cannot be in the past' 
      };
    }

    return { isValid: true, message: '' };
  };

  const calculateEventDuration = () => {
    if (!formData.date || !formData.endDate || !formData.time || !formData.endTime) {
      return '';
    }

    const startDateTime = new Date(`${formData.date}T${formData.time}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    const durationMs = endDateTime - startDateTime;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (durationHours < 1) {
      return `${durationMinutes} minutes`;
    } else if (durationHours === 1 && durationMinutes === 0) {
      return '1 hour';
    } else if (durationHours === 1) {
      return `1 hour ${durationMinutes} minutes`;
    } else if (durationMinutes === 0) {
      return `${durationHours} hours`;
    } else {
      return `${durationHours} hours ${durationMinutes} minutes`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();
      data.append("name", formData.name);
      data.append("date", formData.date);
      data.append("time", formData.time);
      data.append("endTime", formData.endTime);
      data.append("location", formData.location);
      data.append("locationUrl", formData.locationUrl);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("package", formData.package);
      data.append("endDate", formData.endDate);
      data.append("excelFile", formData.excelFile);

      const res = await api.post(
        "/api/events",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message || 'Event created successfully!');
      
      setTimeout(() => {
        navigate("/events");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating event");
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

  const packages = [
    { value: 'Basic', label: 'Basic' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Pro', label: 'Pro' },
    { value: 'Elite', label: 'Elite' }
  ];

  const eventDuration = calculateEventDuration();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
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
        
        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-700 text-sm">Creating your event...</p>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Create New Event</h1>
            <p className="text-gray-600 text-sm">Fill out the form below to create a new event</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Event Name - Full Width */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter event name"
                    maxLength="100"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Letters, numbers, spaces, and & symbol only</p>
                </div>

                {/* Date and Time - 4 columns on desktop, 2 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-xs text-red-600">{errors.date}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.date || new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.time ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.time && (
                      <p className="mt-1 text-xs text-red-600">{errors.time}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.endTime ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                {/* Event Duration Display */}
                {eventDuration && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Event Duration:</span>
                      <span className="text-sm font-bold text-blue-900">{eventDuration}</span>
                    </div>
                  </div>
                )}

                {/* Location and Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter event location"
                      maxLength="200"
                    />
                    {errors.location && (
                      <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Letters, numbers, spaces, and commas only</p>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-xs text-red-600">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="locationUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Location URL
                  </label>
                  <input
                    type="url"
                    id="locationUrl"
                    name="locationUrl"
                    value={formData.locationUrl}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      errors.locationUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Paste the Google Maps URL"
                  />
                  {errors.locationUrl && (
                    <p className="mt-1 text-xs text-red-600">{errors.locationUrl}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Optional Google Maps link for the event location</p>
                </div>

                {/* Package and File Upload - 2 columns on desktop, 1 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="package" className="block text-sm font-medium text-gray-700 mb-2">
                      Package Type *
                    </label>
                    <select
                      id="package"
                      name="package"
                      value={formData.package}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errors.package ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {packages.map(pkg => (
                        <option key={pkg.value} value={pkg.value}>
                          {pkg.label}
                        </option>
                      ))}
                    </select>
                    {errors.package && (
                      <p className="mt-1 text-xs text-red-600">{errors.package}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest List (Excel File) *
                    </label>
                    <div className="space-y-2">
                      <label htmlFor="excelFile" className={`cursor-pointer px-3 py-2 rounded-lg transition duration-300 flex items-center text-sm w-full justify-center ${
                        errors.excelFile ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Upload Excel File
                      </label>
                      <input
                        type="file"
                        id="excelFile"
                        name="excelFile"
                        onChange={handleExcelChange}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                      />
                      
                      {errors.excelFile && (
                        <p className="mt-1 text-xs text-red-600">{errors.excelFile}</p>
                      )}
                      
                      {formData.fileName && (
                        <div className={`p-2 rounded-lg ${uploadStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-medium text-sm truncate">{formData.fileName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description - Full Width */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-vertical ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe your event..."
                    maxLength="500"
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Letters, numbers, spaces, and & symbol only</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 text-sm"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition duration-300 flex items-center justify-center text-sm`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Create Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEvent;
