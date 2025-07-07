// src/components/auth/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Asegúrate que la ruta sea correcta

// Recibe el Layout que debe renderizar si el usuario está autenticado
const PrivateRoute = ({ LayoutComponent }: { LayoutComponent: React.ComponentType }) => {
  const { currentUser, loading } = useAuth();

  // Mientras carga el estado de autenticación, no renderizamos nada o un spinner
  if (loading) {
    return <div>Cargando...</div>; // O un componente de Spinner/Loader
  }

  // Si no hay usuario, redirigimos a la página de login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, renderizamos el Layout correspondiente
  return <LayoutComponent />;
};

export default PrivateRoute;