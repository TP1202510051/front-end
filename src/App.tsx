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
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/authentication/LoginPage';
import RegisterPage from './pages/authentication/RegisterPage';
import ProfilePage from './pages/authentication/ProfilePage';

const router = createBrowserRouter([
  // --- Rutas Públicas ---
  // No usan PrivateRoute y tienen su propio layout simple si es necesario
  {
    path: '/login',
    Component: LoginPage,
    errorElement: <NotFound />,
  },
  {
    path: '/register',
    Component: RegisterPage,
    errorElement: <NotFound />,
  },

  // --- Rutas Protegidas ---
  // Cada grupo de rutas protegidas usa el componente PrivateRoute
  // pasándole el Layout que le corresponde.
  {
    element: <PrivateRoute LayoutComponent={DashboardLayout} />,
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
      {
        // La página de perfil también debe ser privada
        path: '/profile',
        Component: ProfilePage,
      },
    ],
  },
  {
    element: <PrivateRoute LayoutComponent={IconLayout} />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/chat-interface/:projectId',
        Component: ChatInterface,
      },
    ],
  },
  {
    element: <PrivateRoute LayoutComponent={BlankLayout} />,
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
