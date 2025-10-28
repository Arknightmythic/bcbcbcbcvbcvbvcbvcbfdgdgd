import { createBrowserRouter } from "react-router";
import Login from "./features/Auth/pages/Login";
import Layout from "./shared/components/Layout";
import Dashboard from "./features/Dashboard/pages/Dashboard";
import DocumentManagementPage from "./features/DocumentManagement/pages/DocumentManagement";
import UploadPage from "./features/UploadDocument/pages/UploadPage";
import PublicServiceIntroPage from "./features/PublicService/pages/PublicServiceIntroPage";
import PublicServiceChatPage from "./features/PublicService/pages/PublicServiceChatPage";
import HistoryValidationPage from "./features/HistoryValidation/pages/HistoryValidationPage";
import GuidePage from "./features/Guide/pages/GuidePage";

const Router = createBrowserRouter([
    {
        path:'/login',
        element:<Login/>
    },
    {
        path:'/',
        element:<Layout/>,
        children:[
            {
                path:'dashboard',
                element:<Dashboard/>
            },
            {
                path:'document-management',
                element:<DocumentManagementPage/>
            },
            {
                path:'upload-document',
                element:<UploadPage/>
            },
            {
                path: 'public-service', // Halaman Intro & Selector
                element: <PublicServiceIntroPage />
            },
            {
                path: 'public-service/:sessionId', // Halaman Chat aktual
                element: <PublicServiceChatPage />
            },
            {
                path:'validation-history',
                element:<HistoryValidationPage/>
            },
            {
                path:'guide',
                element:<GuidePage/>
            }
        ]
    }
])


export default Router;