import { createBrowserRouter, redirect, Navigate } from "react-router";
import Layout from "./shared/components/Layout";
import Login from "./features/Auth/pages/Login";
import UnauthorizedPage from "./shared/components/UnauthorizedPage";
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
import { authLoader, getDefaultPath, loginLoader, ProtectedRoute, unauthorizedLoader } from "./shared/utils/Guard";
import { NotFoundPage } from "./shared/components/notfound";


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