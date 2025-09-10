import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { register, testFirestoreWrite } from '@/services/auth.service';
import { register } from '@/services/auth.service';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AbstractifyLogo = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0ZM25 75V25H37.5V50H62.5V25H75V75H62.5V50H37.5V75H25Z"
      fill="white"
    />
  </svg>
);

export default function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyRuc, setCompanyRuc] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

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
        setError('Este correo electrónico ya está registrado.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error al crear la cuenta.');
      }
    } else {
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login');
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
          <form onSubmit={handleRegister} className="grid gap-4">
            {/* --- Datos Personales --- */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nombre</Label>
                <Input
                  id="first-name"
                  placeholder="Juan"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input
                  id="last-name"
                  placeholder="Pérez"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-ruc">RUC</Label>
                <Input
                  id="company-ruc"
                  placeholder="20123456789"
                  required
                  value={companyRuc}
                  onChange={(e) => setCompanyRuc(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-phone">Teléfono</Label>
                <Input
                  id="company-phone"
                  placeholder="+51 987654321"
                  required
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="company-address">Dirección</Label>
                <Input
                  id="company-address"
                  placeholder="Av. Principal 123, Lima"
                  required
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
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
              to="/login"
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
