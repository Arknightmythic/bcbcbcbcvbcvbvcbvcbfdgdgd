

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
import { createBrowserRouter, redirect } from "react-router";
import { useAuthStore } from "./shared/store/authStore";
// import HelpDeskPage from "./features/HelpDesk/pages/HelpDeskPage";
// import HelpDeskIntroPage from "./features/HelpDesk/pages/HelpDeskIntroPage";
// import HelpDeskChatPage from "./features/HelpDesk/pages/HelpDeskChatPage";

// Fungsi loader untuk memeriksa status autentikasi
const authLoader = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    // Jika pengguna tidak terautentikasi, arahkan ke halaman login
    return redirect("/login");
  }
  return null;
};

const loginLoader = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    // Jika pengguna sudah login dan mencoba mengakses /login, arahkan ke dashboard
    return redirect("/dashboard");
  }
  return null;
};

const Router = createBrowserRouter([
  {
    path: "/login",
    loader: loginLoader, // Loader untuk halaman login
    element: <Login />,
  },
  {
    path: "/",
    loader: authLoader, // Loader untuk semua rute di dalam layout utama
    element: <Layout />,
    children: [
      {
        // Arahkan dari "/" ke "/dashboard" secara default
        index: true, 
        loader: () => redirect("/dashboard"),
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "document-management",
        element: <DocumentManagementPage />,
      },
      {
        path: "knowledge-base",
        element: <UploadPage />,
      },
      {
        path: "public-service",
        element: <PublicServiceIntroPage />,
      },
      {
        path: "public-service/:sessionId",
        element: <PublicServiceChatPage />,
      },
      {
        path: "validation-history",
        element: <HistoryValidationPage />,
      },
      {
        path: "guide",
        element: <GuidePage />,
      },
      {
        path: "user-management",
        element: <UserManagementPage />,
      },
      {
        path: "team-management",
        element: <TeamManagementPage />,
      },
      {
        path: "role-management", // Perbaiki path agar konsisten
        element: <RoleManagementPage />,
      },
      // {
      //   path: "helpdesk",
      //   element: <HelpDeskPage />,
      //   children: [
      //     {
      //       index: true,
      //       element: <HelpDeskIntroPage />, // Tampilan intro
      //     },
      //     {
      //       path: ":sessionId",
      //       element: <HelpDeskChatPage />, // Tampilan chat aktif
      //     },
      //   ]
      // },
    ],
  },
]);

export default Router;