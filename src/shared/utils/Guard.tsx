import { Navigate, redirect } from "react-router";
import { useAuthStore } from "../store/authStore";
import { PAGE_PATHS } from "./constant";

export const hasReadAccess = (user: any, pageIdentifier: string) => {
  const userPermissions = user?.role?.permissions || [];
  return userPermissions.some((p: any) => p.name === `${pageIdentifier}:read`);
};

export const getDefaultPath = () => {
  const { user, isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated || !user) {
    return "/login";
  }

  
  if (!user.role || !user.role.team) {
    return "/unauthorized";
  }

  const userPages = user.role.team.pages || [];
  const firstAllowedKey = Object.keys(PAGE_PATHS).find(key => {
    const isPageInTeam = userPages.includes(key);
    const isPermitted = hasReadAccess(user, key);
    return isPageInTeam && isPermitted;
  });

  return firstAllowedKey ? PAGE_PATHS[firstAllowedKey] : "/unauthorized";
};


export const authLoader = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    return redirect("/login");
  }
  return null;
};

export const loginLoader = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    const defaultPath = getDefaultPath();
    return redirect(defaultPath);
  }
  return null;
};

export const unauthorizedLoader = () => {
  const { isAuthenticated } = useAuthStore.getState();
  
  if (!isAuthenticated) {
    return redirect("/login");
  }

  const correctPath = getDefaultPath();
  if (correctPath !== "/unauthorized") {
    return redirect(correctPath);
  }

  return null;
};

export const ProtectedRoute = ({ allowedPage, children }: { allowedPage: string, children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);

  
  if (!user?.role || !user?.role?.team) {

    return <Navigate to="/unauthorized" replace />;
  }

  const userPages = user.role.team.pages || [];
  const hasPageInTeam = userPages.includes(allowedPage);
  const hasPermission = hasReadAccess(user, allowedPage);

  if (!hasPageInTeam || !hasPermission) {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
};


