import { createBrowserRouter } from "react-router";
import Login from "./features/Auth/pages/Login";
import Layout from "./shared/components/Layout";
import Dashboard from "./features/Dashboard/pages/Dashboard";
import DocumentManagementPage from "./features/DocumentManagement/pages/DocumentManagement";
import UploadPage from "./features/UploadDocument/pages/UploadPage";

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
            }
        ]
    }
])


export default Router;