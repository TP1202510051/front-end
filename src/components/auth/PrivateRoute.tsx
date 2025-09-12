import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PrivateRoute = ({ LayoutComponent }: { LayoutComponent: React.ComponentType }) => {
  const { idToken, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!idToken) {
    return <Navigate to="/login" replace />;
  }

  return <LayoutComponent />;
};

export default PrivateRoute;
