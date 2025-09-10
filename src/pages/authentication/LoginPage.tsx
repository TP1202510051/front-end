// src/pages/LoginPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/services/auth.service';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider, db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GithubAuthProvider } from "firebase/auth";
import type { FirebaseUser } from '@/models/FirebaseUserModel';

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // El usuario ha iniciado sesión con éxito
      console.log('Usuario logueado con Google:', result.user);
      await createUserProfileNotExists(result.user);
      navigate('/dashboard'); // Redirigir al dashboard
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setError('Ocurrió un error al iniciar sesión con Google. Por favor, inténtalo de nuevo.');
    }
  };

  const loginWithGithub = async () => {
    try {
    const result = await signInWithPopup(auth, githubProvider);

    // Obtener el token de GitHub
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    // Llamar a la API de GitHub
    if (token) {
      const res = await fetch("https://api.github.com/user", {
        headers: { Authorization: `token ${token}` }
      });
      const githubUser = await res.json();
      console.log("Datos extra de GitHub:", githubUser);
      localStorage.setItem("user", JSON.stringify(githubUser));
      // Aquí sí tienes login, email, name, etc.
    }
    await createUserProfileNotExists(result.user);
    navigate('/dashboard'); // Redirigir al dashboard
    } catch (error) {
      console.error('Error al iniciar sesión con GitHub:', error);
      setError('Ocurrió un error al iniciar sesión con GitHub. Por favor, inténtalo de nuevo.');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await login(email, password);

    setLoading(false);

    if (error) {
      // Personalizamos el mensaje de error para el usuario
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setError('El correo o la contraseña son incorrectos.');
      } else {
        setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
      }
    } else {
      // Si el login es exitoso, el PrivateRoute se encargará de redirigir
      // o podemos forzar una redirección al dashboard.
      navigate('/dashboard');
    }
  };

  const createUserProfileNotExists = async (user: FirebaseUser) => {
    if (
      typeof user === "object" &&
      user !== null &&
      "uid" in user &&
      typeof (user).uid === "string"
    ) {
      const u = user;
      const userDocRef = doc(db, "users", u.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        // Crear perfil con datos básicos
        const defaultProfile = {
          firstName: u.displayName ? u.displayName.split(" ")[0] : "Usuario",
          lastName: u.displayName ? u.displayName.split(" ")[1] || "" : "",
          email: u.email || "",
          profilePictureUrl: u.photoURL || "",
          company: {
            name: "",
            ruc: "",
            address: "",
            phone: "",
            companyLogoUrl: ""
          },
        };
        await setDoc(userDocRef, defaultProfile);
      }
    } else {
      throw new Error("Invalid user object");
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-white my-4">Iniciar Sesión</h1>
            <div className='flex flex-col gap-4'>
              <p className="text-balance text-muted-foreground">
                Ingresa con una cuenta existente.
              </p>
              <div className="flex flex-row gap-2">
                <button onClick={loginWithGoogle} className="w-full justify-center gap-2 flex flex-row items-center bg-white text-black border border-white hover:bg-gray-300 font-semibold py-2 px-4 rounded mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
                    <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                  Google
                </button>
                <button onClick={loginWithGithub} className="w-full justify-center gap-2 flex flex-row items-center bg-white text-black border border-white hover:bg-gray-300 font-semibold py-2 px-4 rounded mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 30 30">
                      <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
                  </svg>
                  Github
                </button>
              </div>
            </div>
            <div className="flex items-center ">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-white">O</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className='flex flex-col gap-4'>
              <p className="text-balance text-muted-foreground">
                Ingresa tu correo para acceder a tu panel de proyectos.
              </p>
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
                    className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                  />
                </div>

                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 font-semibold cursor-pointer"
                  disabled={loading}
                >
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="underline font-semibold text-white hover:text-gray-300"
            >
              Regístrate
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-zinc-950 lg:flex items-center justify-center p-8 relative overflow-hidden">
        {/* Fondo con patrón textil */}
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