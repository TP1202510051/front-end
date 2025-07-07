// src/pages/LoginPage.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth.service"; // Importamos nuestra función de login

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await login(email, password);

    setLoading(false);

    if (error) {
      // Personalizamos el mensaje de error para el usuario
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError("El correo o la contraseña son incorrectos.");
      } else {
        setError("Ocurrió un error. Por favor, inténtalo de nuevo.");
      }
    } else {
      // Si el login es exitoso, el PrivateRoute se encargará de redirigir
      // o podemos forzar una redirección al dashboard.
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico para acceder a tu panel de proyectos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                {/* Opcional: Link a "Olvidé mi contraseña" */}
                {/* <Link to="#" className="ml-auto inline-block text-sm underline">
                  ¿Olvidaste tu contraseña?
                </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
            
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}