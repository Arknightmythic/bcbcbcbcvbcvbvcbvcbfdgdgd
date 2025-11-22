import React from "react";
import { createBrowserRouter, redirect, Navigate } from "react-router";

// Layout & Halaman Utama
import Layout from "./shared/components/Layout";
import Login from "./features/Auth/pages/Login";
import Dashboard from "./features/Dashboard/pages/Dashboard";

// Halaman Fitur
import DocumentManagementPage from "./features/DocumentManagement/pages/DocumentManagement";
import UploadPage from "./features/UploadDocument/pages/UploadPage";
import PublicServiceIntroPage from "./features/PublicService/pages/PublicServiceIntroPage";
import PublicServiceChatPage from "./features/PublicService/pages/PublicServiceChatPage";
import HistoryValidationPage from "./features/HistoryValidation/pages/HistoryValidationPage";
import GuidePage from "./features/Guide/pages/GuidePage";
import UserManagementPage from "./features/UserManagement/pages/UserManagementPage";
import TeamManagementPage from "./features/TeamManagements/pages/TeamManagementPage";
import RoleManagementPage from "./features/RoleManagements/pages/RoleManagementPage";
import HelpDeskIntroPage from "./features/HelpDesk/pages/HelpDeskIntroPage";
import HelpDeskChatPage from "./features/HelpDesk/pages/HelpDeskChatPage";

import { useAuthStore } from "./shared/store/authStore";
import HelpDeskPage from "./features/HelpDesk/pages/HelpDeskPage";

// --- KONFIGURASI MAPPING ACCESS RIGHT KE URL ---
// Key: Value dari database (team.pages) -> Value: URL Route Frontend
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
  "helpdesk": "/helpdesk", // Perhatikan URL-nya beda dengan key
};

const getDefaultPath = () => {
  // Ambil state isAuthenticated juga
  const { user, isAuthenticated } = useAuthStore.getState();

  // PERBAIKAN: Jika user belum login, arahkan ke /login, bukan ke logic permission
  if (!isAuthenticated || !user) {
    return "/login";
  }

  const userPages = user?.role?.team?.pages || [];

  // Cari permission valid pertama yang dimiliki user
  const firstAllowedKey = Object.keys(PAGE_PATHS).find(key => userPages.includes(key));

  // Jika ketemu, return URL-nya. 
  // Jika User Login tapi tidak punya akses apapun, baru lempar ke 404.
  return firstAllowedKey ? PAGE_PATHS[firstAllowedKey] : "/404";
};

// --- KOMPONEN PROTEKSI ---
const ProtectedRoute = ({ allowedPage, children }: { allowedPage: string, children: React.ReactNode }) => {
  const { user } = useAuthStore.getState();
  const userPages = user?.role?.team?.pages || [];
  
  if (!userPages.includes(allowedPage)) {
    return <Navigate to="/404" replace />;
  }
  return <>{children}</>;
};

// --- HALAMAN 404 SEDERHANA ---
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <h1 className="text-6xl font-bold text-gray-800">404</h1>
    <p className="text-xl text-gray-600 mt-4">Access Denied or Page Not Found</p>
    <a href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Back to Home</a>
  </div>
);

// --- LOADER LOGIC ---

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
    // PERBAIKAN: Jangan hardcode ke dashboard, tapi ke halaman default user
    const defaultPath = getDefaultPath();
    return redirect(defaultPath);
  }
  return null;
};

const Router = createBrowserRouter([
  {
    path: "/login",
    loader: loginLoader,
    element: <Login />,
  },
  {
    path: "/",
    loader: authLoader,
    element: <Layout />,
    children: [
      {
        index: true, 
        // PERBAIKAN: Redirect root ("/") juga dinamis
        loader: () => {
            const defaultPath = getDefaultPath();
            return redirect(defaultPath);
        },
      },
      // --- BUNGKUS ELEMENT DENGAN PROTECTED ROUTE ---
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