import React from "react";
import { createBrowserRouter, redirect, Navigate } from "react-router";


import Layout from "./shared/components/Layout";


import Login from "./features/Auth/pages/Login";
import UnauthorizedPage from "./features/Auth/pages/UnauthorizedPage";


import Dashboard from "./features/Dashboard/pages/Dashboard";
import DocumentManagementPage from "./features/DocumentManagement/pages/DocumentManagement";
import UploadPage from "./features/UploadDocument/pages/UploadPage"; 
import PublicServiceIntroPage from "./features/PublicService/pages/PublicServiceIntroPage";
import PublicServiceChatPage from "./features/PublicService/pages/PublicServiceChatPage";
import HistoryValidationPage from "./features/HistoryValidation/pages/HistoryValidationPage";
import GuidePage from "./features/Guide/pages/GuidePage";
import UserManagementPage from "./features/UserManagement/pages/UserManagementPage";
import TeamManagementPage from "./features/TeamManagements/pages/TeamManagementPage";
import RoleManagementPage from "./features/RoleManagements/pages/RoleManagementPage";
import HelpDeskPage from "./features/HelpDesk/pages/HelpDeskPage";
import HelpDeskIntroPage from "./features/HelpDesk/pages/HelpDeskIntroPage";
import HelpDeskChatPage from "./features/HelpDesk/pages/HelpDeskChatPage";
import MicrosoftCallback from "./features/Auth/pages/MicrosoftCallback";


import { useAuthStore } from "./shared/store/authStore";




const PAGE_PATHS: Record<string, string> = {
  "dashboard": "/dashboard",
  "knowledge-base": "/knowledge-base",
  "document-management": "/document-management",
  "public-service": "/public-service",
  "validation-history": "/validation-history",
  "guide": "/guide",
  "user-management": "/user-management",
  "team-management": "/team-management",
  "role-management": "/role-management",
  "helpdesk": "/helpdesk",
};




const hasReadAccess = (user: any, pageIdentifier: string) => {
  const userPermissions = user?.role?.permissions || [];
  
  return userPermissions.some((p: any) => p.name === `${pageIdentifier}:read`);
};


const getDefaultPath = () => {
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




const authLoader = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    return redirect("/login");
  }
  return null;
};


const loginLoader = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    const defaultPath = getDefaultPath();
    return redirect(defaultPath);
  }
  return null;
};


const unauthorizedLoader = () => {
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




const ProtectedRoute = ({ allowedPage, children }: { allowedPage: string, children: React.ReactNode }) => {
  const { user } = useAuthStore.getState();
  
  
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


const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-4">
    <h1 className="text-6xl font-bold text-gray-800">404</h1>
    <p className="text-xl text-gray-600 mt-4">Page Not Found or Access Denied</p>
    <a href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
      Back to Home
    </a>
  </div>
);



const Router = createBrowserRouter([
  {
    path: "/login",
    loader: loginLoader,
    element: <Login />,
  },
  {
    path: "/unauthorized",
    loader: unauthorizedLoader, 
    element: <UnauthorizedPage />,
  },
  {
    path: "/auth-microsoft/callback",
    element: <MicrosoftCallback />,
  },
  {
    path: "/",
    loader: authLoader,
    element: <Layout />,
    children: [
      {
        index: true, 
        loader: () => {
            const defaultPath = getDefaultPath();
            return redirect(defaultPath);
        },
      },
      
      {
        path: "dashboard",
        element: <ProtectedRoute allowedPage="dashboard"><Dashboard /></ProtectedRoute>,
      },
      
      {
        path: "document-management",
        element: <ProtectedRoute allowedPage="document-management"><DocumentManagementPage /></ProtectedRoute>,
      },
      
      {
        path: "knowledge-base",
        element: <ProtectedRoute allowedPage="knowledge-base"><UploadPage /></ProtectedRoute>,
      },
      
      {
        path: "public-service",
        element: <ProtectedRoute allowedPage="public-service"><PublicServiceIntroPage /></ProtectedRoute>,
      },
      {
        path: "public-service/:sessionId",
        element: <ProtectedRoute allowedPage="public-service"><PublicServiceChatPage /></ProtectedRoute>,
      },
      
      {
        path: "validation-history",
        element: <ProtectedRoute allowedPage="validation-history"><HistoryValidationPage /></ProtectedRoute>,
      },
      
      {
        path: "guide",
        element: <ProtectedRoute allowedPage="guide"><GuidePage /></ProtectedRoute>,
      },
      
      {
        path: "user-management",
        element: <ProtectedRoute allowedPage="user-management"><UserManagementPage /></ProtectedRoute>,
      },
      
      {
        path: "team-management",
        element: <ProtectedRoute allowedPage="team-management"><TeamManagementPage /></ProtectedRoute>,
      },
      
      {
        path: "role-management",
        element: <ProtectedRoute allowedPage="role-management"><RoleManagementPage /></ProtectedRoute>,
      },
      
      {
        path: "helpdesk",
        element: <HelpDeskPage />, 
        children: [
          {
            index: true,
             element: <ProtectedRoute allowedPage="helpdesk"><HelpDeskIntroPage /></ProtectedRoute>,
          },
          {
            path: ":sessionId",
             element: <ProtectedRoute allowedPage="helpdesk"><HelpDeskChatPage /></ProtectedRoute>,
          },
        ]
      },
    ],
  },
  {
    path: "/404",
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  }
]);

export default Router;