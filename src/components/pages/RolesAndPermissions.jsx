import React, { useState } from 'react';
import Layout from '../layout/Layout';

// Mock data for roles and permissions
const initialRoles = [
  {
    id: 1,
    name: 'Administrator',
    description: 'Full system access with all permissions',
    userCount: 3,
    permissions: {
      users: { read: true, create: true, update: true, delete: true },
      events: { read: true, create: true, update: true, delete: true },
      reports: { read: true, create: true, update: true, delete: true },
      settings: { read: true, create: true, update: true, delete: true }
    }
  },
  {
    id: 2,
    name: 'Event Manager',
    description: 'Can manage events and view reports',
    userCount: 5,
    permissions: {
      users: { read: true, create: false, update: false, delete: false },
      events: { read: true, create: true, update: true, delete: true },
      reports: { read: true, create: false, update: false, delete: false },
      settings: { read: false, create: false, update: false, delete: false }
    }
  },
  {
    id: 3,
    name: 'Content Editor',
    description: 'Can create and update content',
    userCount: 8,
    permissions: {
      users: { read: true, create: false, update: false, delete: false },
      events: { read: true, create: true, update: true, delete: false },
      reports: { read: true, create: false, update: false, delete: false },
      settings: { read: false, create: false, update: false, delete: false }
    }
  },
  {
    id: 4,
    name: 'Viewer',
    description: 'Can only view content',
    userCount: 12,
    permissions: {
      users: { read: true, create: false, update: false, delete: false },
      events: { read: true, create: false, update: false, delete: false },
      reports: { read: true, create: false, update: false, delete: false },
      settings: { read: false, create: false, update: false, delete: false }
    }
  }
];

const permissionCategories = [
  {
    id: 'users',
    name: 'User Management',
    description: 'Permissions related to user accounts',
    actions: [
      { id: 'read', name: 'View Users' },
      { id: 'create', name: 'Create Users' },
      { id: 'update', name: 'Edit Users' },
      { id: 'delete', name: 'Delete Users' }
    ]
  },
  {
    id: 'events',
    name: 'Event Management',
    description: 'Permissions related to events',
    actions: [
      { id: 'read', name: 'View Events' },
      { id: 'create', name: 'Create Events' },
      { id: 'update', name: 'Edit Events' },
      { id: 'delete', name: 'Delete Events' }
    ]
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Permissions related to reports and analytics',
    actions: [
      { id: 'read', name: 'View Reports' },
      { id: 'create', name: 'Create Reports' },
      { id: 'update', name: 'Edit Reports' },
      { id: 'delete', name: 'Delete Reports' }
    ]
  },
  {
    id: 'settings',
    name: 'System Settings',
    description: 'Permissions related to system configuration',
    actions: [
      { id: 'read', name: 'View Settings' },
      { id: 'create', name: 'Create Settings' },
      { id: 'update', name: 'Edit Settings' },
      { id: 'delete', name: 'Delete Settings' }
    ]
  }
];

const RolesAndPermissions = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(initialRoles[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {
      users: { read: false, create: false, update: false, delete: false },
      events: { read: false, create: false, update: false, delete: false },
      reports: { read: false, create: false, update: false, delete: false },
      settings: { read: false, create: false, update: false, delete: false }
    }
  });

  const handlePermissionChange = (category, action, value) => {
    if (isEditing && selectedRole) {
      const updatedRoles = roles.map(role => {
        if (role.id === selectedRole.id) {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [category]: {
                ...role.permissions[category],
                [action]: value
              }
            }
          };
        }
        return role;
      });
      
      setRoles(updatedRoles);
      setSelectedRole(updatedRoles.find(role => role.id === selectedRole.id));
    }
  };

  const handleNewRolePermissionChange = (category, action, value) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [category]: {
          ...newRole.permissions[category],
          [action]: value
        }
      }
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real application, you would save to an API here
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRoles(initialRoles);
    setSelectedRole(initialRoles.find(role => role.id === selectedRole.id));
  };

  const handleAddRole = () => {
    if (newRole.name.trim() === '') return;
    
    const newRoleWithId = {
      ...newRole,
      id: Math.max(...roles.map(role => role.id)) + 1,
      userCount: 0
    };
    
    setRoles([...roles, newRoleWithId]);
    setSelectedRole(newRoleWithId);
    setNewRole({
      name: '',
      description: '',
      permissions: {
        users: { read: false, create: false, update: false, delete: false },
        events: { read: false, create: false, update: false, delete: false },
        reports: { read: false, create: false, update: false, delete: false },
        settings: { read: false, create: false, update: false, delete: false }
      }
    });
    setShowAddRole(false);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);
      
      if (selectedRole.id === roleId) {
        setSelectedRole(updatedRoles[0] || null);
      }
    }
  };

  const toggleSelectAll = (category, value) => {
    if (isEditing && selectedRole) {
      const updatedRoles = roles.map(role => {
        if (role.id === selectedRole.id) {
          const updatedPermissions = { ...role.permissions };
          
          permissionCategories
            .find(cat => cat.id === category)
            .actions.forEach(action => {
              updatedPermissions[category][action.id] = value;
            });
            
          return {
            ...role,
            permissions: updatedPermissions
          };
        }
        return role;
      });
      
      setRoles(updatedRoles);
      setSelectedRole(updatedRoles.find(role => role.id === selectedRole.id));
    }
  };

  return (
    <Layout>
         <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="mt-2 text-lg text-gray-600">Manage user roles and their permissions</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Roles List */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Roles</h2>
                <button
                  onClick={() => setShowAddRole(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Role
                </button>
              </div>
              
              <div className="divide-y divide-gray-200">
                {roles.map(role => (
                  <div 
                    key={role.id}
                    className={`px-6 py-4 cursor-pointer transition-colors duration-150 ${
                      selectedRole?.id === role.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{role.userCount} users</p>
                      </div>
                      {role.name !== 'Administrator' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-150"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="w-full lg:w-3/4">
            {showAddRole ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Add New Role</h2>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <label htmlFor="role-name" className="block text-sm font-medium text-gray-700">
                      Role Name
                    </label>
                    <input
                      type="text"
                      id="role-name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                      placeholder="Enter role name"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="role-description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="role-description"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newRole.description}
                      onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      placeholder="Enter role description"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Permissions</h3>
                    
                    <div className="space-y-6">
                      {permissionCategories.map(category => (
                        <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                          </div>
                          
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {category.actions.map(action => (
                              <div key={action.id} className="flex items-center">
                                <input
                                  id={`new-${category.id}-${action.id}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  checked={newRole.permissions[category.id][action.id]}
                                  onChange={(e) => handleNewRolePermissionChange(category.id, action.id, e.target.checked)}
                                />
                                <label htmlFor={`new-${category.id}-${action.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                  {action.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddRole(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddRole}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Role
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedRole ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{selectedRole.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedRole.description}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit Permissions
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Permissions</h3>
                    
                    <div className="space-y-6">
                      {permissionCategories.map(category => (
                        <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                            </div>
                            
                            {isEditing && (
                              <button
                                onClick={() => {
                                  const allSelected = category.actions.every(
                                    action => selectedRole.permissions[category.id][action.id]
                                  );
                                  toggleSelectAll(category.id, !allSelected);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {category.actions.every(action => selectedRole.permissions[category.id][action.id])
                                  ? 'Deselect All' : 'Select All'}
                              </button>
                            )}
                          </div>
                          
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {category.actions.map(action => (
                              <div key={action.id} className="flex items-center">
                                <input
                                  id={`${category.id}-${action.id}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  checked={selectedRole.permissions[category.id][action.id]}
                                  onChange={(e) => handlePermissionChange(category.id, action.id, e.target.checked)}
                                  disabled={!isEditing || (selectedRole.name === 'Administrator' && !isEditing)}
                                />
                                <label htmlFor={`${category.id}-${action.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                  {action.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Users with this Role</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        There {selectedRole.userCount === 1 ? 'is' : 'are'} {selectedRole.userCount} user{selectedRole.userCount === 1 ? '' : 's'} with this role.
                      </p>
                      <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                        View all users with this role →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No role selected</h3>
                <p className="mt-2 text-sm text-gray-500">Select a role from the list to view and edit its permissions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default RolesAndPermissions;