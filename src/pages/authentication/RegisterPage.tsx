import { AbstractifyLogo } from '@/assets/icons/AbstractifyLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from "@/hooks/useRegister";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/utils/constants/navigations';
import { loginWithEmail } from "@/services/auth.service";


export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  companyName: "",
  companyRuc: "",
  companyAddress: "",
  companyPhone: "",
});

  const { handleRegister, loading, error } = useRegister();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      company: {
        name: formData.companyName,
        ruc: formData.companyRuc,
        address: formData.companyAddress,
        phone: formData.companyPhone,
      },
    };

    const user = await handleRegister(userData, formData.password);

    if (user) {
      // 1. Autologin tras registro
      const loginResult = await loginWithEmail(formData.email, formData.password);

      if (typeof loginResult === "string") {
        // error string
        console.error("Error al hacer login automático:", loginResult);
      } else {
        // login exitoso
        navigate("/dashboard"); // cambiar a tu ruta real
      }
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-white">Crear una Cuenta</h1>
            <p className="text-balance text-muted-foreground">
              Completa el formulario para registrar tu empresa.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* --- Datos Personales --- */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nombre</Label>
                <Input
                  id="first-name"
                  placeholder="Juan"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input
                  id="last-name"
                  placeholder="Pérez"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
              />
            </div>
            <hr className="border-zinc-700 my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="company-name">Nombre de la Empresa</Label>
                <Input
                  id="company-name"
                  placeholder="Textiles Andinos S.A.C."
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-ruc">RUC</Label>
                <Input
                  id="company-ruc"
                  placeholder="20123456789"
                  required
                  value={formData.companyRuc}
                  onChange={(e) => setFormData({ ...formData, companyRuc: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-phone">Teléfono</Label>
                <Input
                  id="company-phone"
                  placeholder="+51 987654321"
                  required
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="company-address">Dirección</Label>
                <Input
                  id="company-address"
                  placeholder="Av. Principal 123, Lima"
                  required
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            {/* <Button
              type="button"
              onClick={testFirestoreWrite}
              className="w-full bg-yellow-500 text-black"
            >
              Probar Escritura en Firestore
            </Button> */}

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-200 font-semibold"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>
          <div className="mt-2 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to={login}
              className="underline font-semibold text-white hover:text-gray-300"
            >
              Inicia Sesión
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-zinc-950 lg:flex items-center justify-center p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-repeat opacity-5"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/subtle-zebra-3d.png')`,
          }}
        ></div>
        <div className="relative z-10 text-center text-white">
          <div className="flex justify-center mb-4">
            <AbstractifyLogo />
          </div>
          <h2 className="text-4xl font-bold mb-2">Abstractify</h2>
          <p className="text-xl text-zinc-400">
            Construye tiendas digitales a través de lenguaje natural.
          </p>
        </div>
      </div>
    </div>
  );
}