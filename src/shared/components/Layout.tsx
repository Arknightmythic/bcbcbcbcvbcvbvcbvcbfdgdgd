import { Outlet } from "react-router"
import Header from "./header"
import Sidebar from "./Sidebar"

function Layout() {
  return (
    
   <div className="flex min-h-screen relative">
      <div className="flex flex-col flex-1 ml-20 md:ml-72">
        <Sidebar/>
        <Header/>
        <main className="flex-1 px-8 pt-5 bg-[#F9FAFB] overflow-auto relative mr-0 pr-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout