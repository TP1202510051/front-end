import './App.css'
import Home from './pages/home/Home';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router"
import Dashboard from './pages/dashboard/Dashboard.tsx'
import Editor from './pages/design-interface/DesignInterface.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        Component: Home
      },
      { 
        path: "dashboard",
        Component: Dashboard
      },
      {
        path: "design",
        Component: Editor
      }
    ]
  }
]);

function App() {
  return (
    <>
      <Outlet/>
      <RouterProvider router={router} />
    </>
  )
}

export default App
