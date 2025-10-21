import { createBrowserRouter } from "react-router";
import Login from "./features/Auth/pages/Login";
import Layout from "./shared/components/Layout";
import Dashboard from "./features/Dashboard/pages/Dashboard";

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
            }
        ]
    }
])


export default Router;