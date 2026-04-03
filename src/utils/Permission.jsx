// ✅ Check if user has a specific permission
export const hasPermission = (permissions, required) => {
  return permissions.some(p => p.name === required);
};

// ✅ Check if user has ANY of a list of permissions
export const hasAnyPermission = (permissions, requiredList) => {
  return requiredList.some(required =>
    permissions.some(p => p.name === required)
  );
};
