import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';

const UserPermissions = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

    const [hasAccess, setHasAccess] = useState(null); // <-- NEW

  // Your permissions data with IDs
  const defaultPermissions = [
    {"id":"73cc64f3-baec-11f0-a366-f430b9110f54","name":"user_add","description":"Can add a new user"},
    {"id":"73cc6b29-baec-11f0-a366-f430b9110f54","name":"user_edit","description":"Can edit user details"},
    {"id":"73cc6c93-baec-11f0-a366-f430b9110f54","name":"user_delete","description":"Can delete users"},
    {"id":"73cc6d8a-baec-11f0-a366-f430b9110f54","name":"user_view","description":"Can view users"},

    {"id":"73cc6f05-baec-11f0-a366-f430b9110f54","name":"user_set_permissions","description":"Can assign permissions to users"},
    {"id":"73cc6fb0-baec-11f0-a366-f430b9110f54","name":"event_add","description":"Can create events"},
    {"id":"73cc705b-baec-11f0-a366-f430b9110f54","name":"event_edit","description":"Can edit events"},
    {"id":"73cc7107-baec-11f0-a366-f430b9110f54","name":"event_delete","description":"Can delete events"},
    {"id":"73cc71a8-baec-11f0-a366-f430b9110f54","name":"event_view","description":"Can view events"},
    {"id":"73cc7247-baec-11f0-a366-f430b9110f54","name":"event_view_report","description":"Can view event reports"},
    {"id":"73cc72ea-baec-11f0-a366-f430b9110f54","name":"event_manage_scanners","description":"Can manage scanners for an event"},
    {"id":"73cc73a0-baec-11f0-a366-f430b9110f54","name":"event_cancel","description":"Can cancel events"},
    {"id":"73cc741a-baec-11f0-a366-f430b9110f54","name":"event_mark_completed","description":"Can mark events as completed"},
    {"id":"73cc74ae-baec-11f0-a366-f430b9110f54","name":"scanninglogs_view","description":"Can view QR code scanning logs"},
    {"id":"73cc752f-baec-11f0-a366-f430b9110f54","name":"dashboard_view","description":"Can view dashboard"},
    {"id":"73cc75ed-baec-11f0-a366-f430b9110f54","name":"invitation_generate","description":"Can generate invitation cards"},
    {"id":"73cc7661-baec-11f0-a366-f430b9110f54","name":"invitation_send","description":"Can send invitations"}
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch user details
        const userResponse = await axios.get(`http://localhost:5000/api/users/getuserinfo/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data.user);

        // Fetch user's current permissions
        const permissionsResponse = await axios.get(`http://localhost:5000/api/users/permissions/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

       // console.log("User Permissions Data:", permissionsResponse.data);
        
        // Extract just the permission IDs from the response
        const userPermissionIds = permissionsResponse.data.map(p => p.id);
        //console.log("User Permission IDs:", userPermissionIds);
        
        setUserPermissions(userPermissionIds);
        setAllPermissions(defaultPermissions);
        setHasAccess(true);
        
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setHasAccess(false);
          //alert('You do not have permission to view this user\'s permissions.');
        }
        console.error('Error fetching user data:', error);
        alert('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId,navigate]);

  const handlePermissionToggle = (permissionId) => {
    //console.log("Toggling permission:", permissionId);
    //console.log("Current user permissions before:", userPermissions);
    
    setUserPermissions(prev => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId];
      
     // console.log("Current user permissions after:", newPermissions);
      return newPermissions;
    });
  };

  const handleSelectAll = (category) => {
    const categoryPermissions = allPermissions
      .filter(p => p.name.startsWith(category))
      .map(p => p.id);
    
    setUserPermissions(prev => {
      const hasAllCategory = categoryPermissions.every(id => prev.includes(id));
      if (hasAllCategory) {
        // Remove all category permissions
        return prev.filter(id => !categoryPermissions.includes(id));
      } else {
        // Add all category permissions
        const newPerms = [...prev];
        categoryPermissions.forEach(id => {
          if (!newPerms.includes(id)) {
            newPerms.push(id);
          }
        });
        return newPerms;
      }
    });
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      console.log("Saving permissions:", userPermissions);
      
      await axios.put(`http://localhost:5000/api/users/${userId}/permissions`, 
        { permissions: userPermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Permissions updated successfully!');
      navigate('/users');
    } catch (error) {
      const errormessage= error.response?.data?.message || error.message;
      console.error('Error updating permissions:', error);
      alert(`Failed to update permissions: ${errormessage}`);
    } finally {
      setSaving(false);
    }
  };


  // 🔒 Handle redirect cleanly before rendering page content
  useEffect(() => {
    if (hasAccess === false) {
      navigate("/403", { replace: true });
    }
  }, [hasAccess, navigate]);

  const groupPermissionsByCategory = () => {
    const groups = {};
    allPermissions.forEach(permission => {
      const category = permission.name.split('_')[0]; // 'user', 'event', etc.
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });
    return groups;
  };

  // Helper function to check if a permission is selected
  const isPermissionSelected = (permissionId) => {
    const isSelected = userPermissions.includes(permissionId);
    //console.log(`Permission ${permissionId} is selected:`, isSelected);
    return isSelected;
  };

  if (loading || hasAccess===null) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user permissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const permissionGroups = groupPermissionsByCategory();

   if (!hasAccess) {
    return null; // Nothing renders before navigation
  }

  return (
   <Layout>
  <div className="container mx-auto px-3 py-4 max-w-4xl">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Manage User Permissions</h1>
        <p className="text-gray-600 text-sm mt-1">
          For: {user?.firstname} {user?.lastname} ({user?.email})
        </p>
      </div>
      <Link
        to="/users"
        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded flex items-center text-sm w-fit"
      >
        Back to Users
      </Link>
    </div>

    {/* Permissions Grid */}
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">User Permissions</h2>
        <p className="text-gray-600 text-xs">Select the permissions you want to grant to this user</p>
      </div>

      <div className="p-4">
        {Object.entries(permissionGroups).map(([category, categoryPermissions]) => (
          <div key={category} className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800 capitalize">
                {category} Permissions
              </h3>
              <button
                onClick={() => handleSelectAll(category)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {categoryPermissions.every(p => userPermissions.includes(p.id)) 
                  ? 'Deselect All' 
                  : 'Select All'
                }
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryPermissions.map(permission => {
                const isSelected = isPermissionSelected(permission.id);
                return (
                  <div
                    key={permission.id}
                    className={`flex items-start p-3 border rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePermissionToggle(permission.id)}
                  >
                    <div className="flex items-center h-4 mt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="ml-2.5 flex-1 min-w-0">
                      <label className="text-sm font-medium text-gray-900 cursor-pointer block truncate">
                        {permission.name}
                      </label>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2">
        <Link
          to="/users"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium text-sm text-center"
        >
          Cancel
        </Link>
        <button
          onClick={handleSavePermissions}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5"></div>
              Saving...
            </>
          ) : (
            'Save Permissions'
          )}
        </button>
      </div>
    </div>
  </div>
</Layout>
  );
};

export default UserPermissions;