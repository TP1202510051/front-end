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
import { register } from "@/services/auth.service"; // Importamos la nueva función

export default function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRuc, setCompanyRuc] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const userData = {
      firstName,
      lastName,
      email,
      company: {
        name: companyName,
        ruc: companyRuc,
        address: companyAddress,
        phone: companyPhone,
      },
    };

    const { error } = await register(userData, password);
    setLoading(false);

    if (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError("Este correo electrónico ya está registrado.");
      } else if (error.code === 'auth/weak-password') {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("Ocurrió un error al crear la cuenta.");
      }
    } else {
      // Éxito. Redirigimos al usuario a la página de login.
      alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
      navigate("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-xl">Registro de Empresa</CardTitle>
          <CardDescription>
            Completa los datos para crear tu cuenta y la de tu empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* --- Datos del Propietario --- */}
            <div className="grid gap-2">
              <Label htmlFor="first-name">Nombre</Label>
              <Input id="first-name" placeholder="Juan" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Apellido</Label>
              <Input id="last-name" placeholder="Pérez" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="nombre@empresa.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {/* --- Datos de la Empresa --- */}
            <div className="md:col-span-2 mt-4">
              <h3 className="font-semibold">Datos de la Empresa</h3>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input id="company-name" placeholder="Textiles Andinos S.A.C." required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="company-ruc">RUC</Label>
              <Input id="company-ruc" placeholder="20123456789" required value={companyRuc} onChange={(e) => setCompanyRuc(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-address">Dirección</Label>
              <Input id="company-address" placeholder="Av. Principal 123, Lima" required value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-phone">Teléfono de Contacto</Label>
              <Input id="company-phone" placeholder="+51 987654321" required value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
            </div>

            {error && <p className="md:col-span-2 text-sm font-medium text-destructive">{error}</p>}
            
            <div className="md:col-span-2">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="underline">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}