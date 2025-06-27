import { createBrowserRouter, RouterProvider } from 'react-router';
import './App.css';
import { BlankLayout } from './layouts/BlankLayout.tsx';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';
//import DesignInterface from './pages/design-interface/DesignInterface.tsx';
import DesignInterfaceRender from './pages/design-interface/DesignInterfaceRender.tsx';
import Home from './pages/home/Home';
import NotFound from './pages/not-found/NotFound.tsx';
import IconLayout from './layouts/IconLayout.tsx';
import ChatInterface from './pages/chat-interface/ChatInterface.tsx';

const router = createBrowserRouter([
  {
    Component: DashboardLayout,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        Component: Home,
      },
      {
        path: '/dashboard',
        Component: Dashboard,
      },
    ],
  },
  {
    Component: IconLayout,
    errorElement: <NotFound />,
    children: [
      {
        path: '/chat-interface/:projectId',
        Component: ChatInterface,
      },
    ],
  },
  {
    Component: BlankLayout,
    errorElement: <NotFound />,
    children: [
      {
        path: '/design-interface/:projectId/:projectName',
        Component: DesignInterfaceRender,
      },
    ],
  },
]);

function App() {
  return (
    <div className="min-h-screen text-white">
      <main>
        <RouterProvider router={router} />
      </main>
    </div>
  );
}

export default App;
