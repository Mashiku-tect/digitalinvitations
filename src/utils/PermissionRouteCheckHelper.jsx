import { permissionRoutes } from "./PermissionRoutes";

export const getFirstAllowedRoute = (permissions) => {
  for (const p of permissions) {
    const route = permissionRoutes[p.name];
    if (route) return route;
  }
  return "/xx"; // no route found
};
