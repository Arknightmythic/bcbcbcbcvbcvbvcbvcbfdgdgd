import Layout from "./shared/components/Layout";
import Login from "./features/Auth/pages/Login";
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
import { createBrowserRouter, redirect } from "react-router";
import { useAuthStore } from "./shared/store/authStore";
// import HelpDeskPage from "./features/HelpDesk/pages/HelpDeskPage";
// import HelpDeskIntroPage from "./features/HelpDesk/pages/HelpDeskIntroPage";
// import HelpDeskChatPage from "./features/HelpDesk/pages/HelpDeskChatPage";


const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <h1 className="text-6xl font-bold text-bOss-red">403</h1>
    <p className="text-xl text-gray-700 mt-2">Access Denied / Unauthorized</p>
    <p className="text-gray-500 mt-1">You do not have permission to view this page.</p>
    {/* PERBAIKAN KRITIS: Ubah link kembali ke root "/" agar initialRedirectLoader bisa berjalan
        dan menemukan halaman yang valid, bukan hardcode ke "/dashboard". */}
    <a href="/" className="mt-6 text-sm text-white bg-bOss-red px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Go to a Valid Page</a>
  </div>
);

// BARU: Fungsi loader untuk mengarahkan pengguna ke halaman pertama yang tersedia setelah login
const initialRedirectLoader = () => {
  const { isAuthenticated, user } = useAuthStore.getState();

  if (!isAuthenticated) {
    return redirect("/login"); 
  }

  // Ambil daftar halaman yang diizinkan
  const allowedPages = user?.role?.team?.pages || [];
  
  if (allowedPages.length > 0) {
    return redirect(`/${allowedPages[0]}`); 
  }

  // Jika user tidak memiliki akses ke halaman manapun (allowedPages kosong)
  return redirect("/unauthorized"); 
};

// BARU: Fungsi loader untuk memeriksa akses halaman (RBAC)
const pageLoader = (identifier: string) => () => {
  const { isAuthenticated, user } = useAuthStore.getState();

  if (!isAuthenticated) {
    return redirect("/login");
  }

  // Cek Akses Halaman
  const allowedPages = user?.role?.team?.pages || [];
  
  if (allowedPages.includes(identifier)) {
    return null; // Lanjutkan ke halaman
  }

  // Jika tidak memiliki akses, arahkan ke halaman Unauthorized
  return redirect("/unauthorized"); 
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
    // PERBAIKAN KRITIS: Ubah redirect dari "/dashboard" ke "/"
    // Ini memastikan logic initialRedirectLoader dijalankan untuk menemukan halaman pendaratan yang aman.
    return redirect("/");
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
    path: "/unauthorized", 
    element: <UnauthorizedPage />,
  },
  {
    path: "/",
    loader: authLoader, 
    element: <Layout />,
    children: [
      {
        // Gunakan initialRedirectLoader untuk menentukan rute awal yang aman
        index: true, 
        loader: initialRedirectLoader,
      },
      {
        path: "dashboard",
        loader: pageLoader("dashboard"),
        element: <Dashboard />,
      },
      {
        path: "document-management",
        loader: pageLoader("document-management"),
        element: <DocumentManagementPage />,
      },
      {
        path: "knowledge-base",
        loader: pageLoader("knowledge-base"),
        element: <UploadPage />,
      },
      {
        path: "public-service",
        loader: pageLoader("public-service"),
        element: <PublicServiceIntroPage />,
      },
      {
        // Rute anak mewarisi loader dari induk (public-service)
        path: "public-service/:sessionId",
        loader: pageLoader("public-service"),
        element: <PublicServiceChatPage />, 
      },
      {
        path: "validation-history",
        loader: pageLoader("validation-history"),
        element: <HistoryValidationPage />,
      },
      {
        path: "guide",
        loader: pageLoader("guide"),
        element: <GuidePage />,
      },
      {
        path: "user-management",
        loader: pageLoader("user-management"),
        element: <UserManagementPage />,
      },
      {
        path: "team-management",
        loader: pageLoader("team-management"),
        element: <TeamManagementPage />,
      },
      {
        path: "role-management", 
        loader: pageLoader("role-management"),
        element: <RoleManagementPage />,
      },
      {
        path: "*",
        element: <UnauthorizedPage />, 
      },

    ],
  },
]);

export default Router;