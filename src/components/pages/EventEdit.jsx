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
    endDate: '',
    time: '',
    endTime: '',
    location: '',
    description: '',
    category: 'personal',
    package: 'Basic', // Added package field
    excelFile: null,
    fileName: ''
  });

  const [uploadStatus, setUploadStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [hasAccess, setHasAccess] = useState(null);

  const categories = [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  const packages = [ // Added packages array
    { value: 'Basic', label: 'Basic' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Pro', label: 'Pro' },
    { value: 'Elite', label: 'Elite' }
  ];

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
       // console.log("event dataa", response.data.event);
        setFormData({
          name: event.eventName,
          date: event.eventDate.split('T')[0],
          endDate: event.endDate ? event.endDate.split('T')[0] : event.eventDate.split('T')[0],
          time: event.eventTime,
          endTime: event.eventEndTime || '',
          location: event.location,
          description: event.description,
          category: event.category,
          package: event.packagename || 'Basic', // Set package from event data
          excelFile: null,
          fileName: ''
        });
        
        setHasAccess(true);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setHasAccess(false);
        }
        console.error('Error fetching event:', error);
        toast.error('Failed to load event data');
      } finally {
        setIsLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  useEffect(() => {
    if (hasAccess === false) {
      navigate("/403", { replace: true });
    }
  }, [hasAccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-adjust end date if it's before start date
    if (name === 'date' && value > formData.endDate) {
      setFormData(prev => ({
        ...prev,
        endDate: value
      }));
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
    // Check if end date is before start date
    if (formData.endDate && formData.date && formData.endDate < formData.date) {
      toast.error('End date cannot be before start date');
      return false;
    }

    // If same day, check if end time is after start time
    if (formData.endTime && formData.time && formData.date === formData.endDate && formData.endTime <= formData.time) {
      toast.error('End time must be after start time when events are on the same day');
      return false;
    }

    // Check if event duration is reasonable (not more than 30 days)
    if (formData.date && formData.endDate) {
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.endDate);
      const durationInDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
      if (durationInDays > 30) {
        toast.error('Event duration seems too long. Please check your dates.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if the user has uploaded a new excel file
    if (formData.excelFile) {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = formData.excelFile.name.substring(formData.excelFile.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Please upload a valid Excel file (.xlsx, .xls, or .csv)');
        return;
      }
    } else {
      // Force the user to upload a file
      toast.error('Please upload an Excel file to update the guest list');
      return; 
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      data.append("name", formData.name);
      data.append("date", formData.date);
      data.append("endDate", formData.endDate);
      data.append("time", formData.time);
      data.append("endTime", formData.endTime);
      data.append("location", formData.location);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("package", formData.package); // Added package to form data
      
      // Only append the file if a new one was selected
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
      console.error(err.response.data.message);
      alert(err.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventDuration = () => {
    if (!formData.date || !formData.endDate) return '';
    
    const startDate = new Date(formData.date);
    const endDate = new Date(formData.endDate);
    const durationInDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    
    if (durationInDays === 0) {
      return 'Single-day event';
    } else if (durationInDays === 1) {
      return '1 day';
    } else {
      return `${durationInDays} days`;
    }
  };

  // Only show loading for initial event data fetch, not for form submission
  if (isLoadingEvent || hasAccess === null) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading Event data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-3 md:px-6 relative">
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
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Edit Event</h1>
            <p className="text-gray-600 text-sm">Update your event details below</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <form onSubmit={handleSubmit} className="p-4 md:p-6">
              <div className="space-y-4">
                {/* Event Name - Full Width */}
                <div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter event name"
                  />
                </div>

                {/* Start Date, End Date, Start Time, End Time - Four columns on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      min={formData.date}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Duration Display */}
                {formData.date && formData.endDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">
                        {formData.date === formData.endDate ? 'Single-day Event' : 'Multi-day Event'}
                      </span>
                      <span className="text-sm text-blue-600 font-semibold">
                        {getEventDuration()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Location, Category, and Package - Three columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter event location"
                    />
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Package Selection - Added this section */}
                  <div>
                    <label htmlFor="package" className="block text-sm font-medium text-gray-700 mb-1">
                      Package *
                    </label>
                    <select
                      id="package"
                      name="package"
                      value={formData.package}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      {packages.map(pkg => (
                        <option key={pkg.value} value={pkg.value}>
                          {pkg.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Excel File Upload */}
                <div>
                  <label htmlFor="excelFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Update Guest List (Optional)
                  </label>
                  <div className="space-y-2">
                    <label htmlFor="excelFile" className="cursor-pointer bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition duration-300 flex items-center justify-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Upload New Excel File
                    </label>
                    <input
                      type="file"
                      id="excelFile"
                      name="excelFile"
                      onChange={handleExcelChange}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                    />
                    
                    {formData.fileName && (
                      <div className={`p-2 rounded text-xs ${uploadStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-medium">{formData.fileName}</span>
                        </div>
                        <p className="mt-1">
                          {uploadStatus === 'success' 
                            ? 'File successfully uploaded. This will replace your existing guest list.'
                            : 'New file selected for upload.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Describe your event..."
                  ></textarea>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200 mt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/events`)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition duration-300 text-sm"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-4 py-2 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded transition duration-300 flex items-center justify-center text-sm`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                      </svg>
                      Update Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center text-xs text-gray-600">
            <p>Fields marked with * are required</p>
            <p className="mt-1">End date cannot be before start date</p>
            <p className="mt-1">When events are on the same day, end time must be after start time</p>
            <p className="mt-1">Upload a new Excel file only if you want to update your guest list</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditEvent;