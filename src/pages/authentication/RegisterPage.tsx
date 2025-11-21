import { AbstractifyLogo } from '@/assets/icons/AbstractifyLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from "@/hooks/useRegister";
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/utils/constants/navigations';
import { Eye, EyeOff } from 'lucide-react';
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

  // Estados para validación
  const [showPassword, setShowPassword] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    companyRuc: '',
    companyPhone: '',
    companyAddress: ''
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    companyName: false,
    companyRuc: false,
    companyPhone: false,
    companyAddress: false
  });

  // Referencias para auto-focus
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const companyRucRef = useRef<HTMLInputElement>(null);
  const companyPhoneRef = useRef<HTMLInputElement>(null);
  const companyAddressRef = useRef<HTMLInputElement>(null);

  // Funciones de validación
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return `${name === 'firstName' ? 'El nombre' : 'El apellido'} es requerido`;
        if (value.trim().length < 2) return `${name === 'firstName' ? 'El nombre' : 'El apellido'} debe tener al menos 2 caracteres`;
        return '';

      case 'email': {
        if (!value.trim()) return '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Correo electrónico inválido';
        return '';
      }

      case 'password':
        if (!value) return '';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return '';

      case 'companyName':
        if (!value.trim()) return 'El nombre de la empresa es requerido';
        return '';

      case 'companyRuc': {
        if (!value.trim()) return 'El RUC es requerido';
        const rucRegex = /^\d{11}$/;
        if (!rucRegex.test(value.trim())) return 'El RUC debe tener 11 dígitos';
        return '';
      }

      case 'companyPhone':
        if (!value.trim()) return 'El teléfono es requerido';
        if (value.trim().length < 9) return 'El teléfono debe tener al menos 9 caracteres';
        return '';

      case 'companyAddress':
        if (!value.trim()) return 'La dirección es requerida';
        return '';

      default:
        return '';
    }
  };

  // Manejar cambios en campos
  const handleFieldChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });

    // Solo validar si el campo ya fue tocado
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  // Manejar blur (pérdida de foco)
  const handleFieldBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors({ ...errors, [name]: error });
  };

  // Toggle mostrar/ocultar contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Trigger shake animation
  const triggerShakeAnimation = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 650);
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allTouched = {
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      companyName: true,
      companyRuc: true,
      companyPhone: true,
      companyAddress: true
    };
    setTouched(allTouched);

    // Validar todos los campos (verificando valores con trim para evitar espacios en blanco)
    const newErrors = {
      firstName: formData.firstName.trim() ? validateField('firstName', formData.firstName) : 'El nombre es requerido',
      lastName: formData.lastName.trim() ? validateField('lastName', formData.lastName) : 'El apellido es requerido',
      email: formData.email.trim() ? validateField('email', formData.email) : 'El correo electrónico es requerido',
      password: formData.password ? validateField('password', formData.password) : 'La contraseña es requerida',
      companyName: formData.companyName.trim() ? validateField('companyName', formData.companyName) : 'El nombre de la empresa es requerido',
      companyRuc: formData.companyRuc.trim() ? validateField('companyRuc', formData.companyRuc) : 'El RUC es requerido',
      companyPhone: formData.companyPhone.trim() ? validateField('companyPhone', formData.companyPhone) : 'El teléfono es requerido',
      companyAddress: formData.companyAddress.trim() ? validateField('companyAddress', formData.companyAddress) : 'La dirección es requerida'
    };
    setErrors(newErrors);

    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some(error => error !== '');

    if (hasErrors) {
      triggerShakeAnimation();
      // Enfocar el primer campo con error
      if (newErrors.firstName) firstNameRef.current?.focus();
      else if (newErrors.lastName) lastNameRef.current?.focus();
      else if (newErrors.email) emailRef.current?.focus();
      else if (newErrors.password) passwordRef.current?.focus();
      else if (newErrors.companyName) companyNameRef.current?.focus();
      else if (newErrors.companyRuc) companyRucRef.current?.focus();
      else if (newErrors.companyPhone) companyPhoneRef.current?.focus();
      else if (newErrors.companyAddress) companyAddressRef.current?.focus();
      return;
    }

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
        <div className="mx-auto grid w-full max-w-md gap-6 animate-fadeIn">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-white">Crear una Cuenta</h1>
            <p className="text-balance text-muted-foreground">
              Completa el formulario para registrar tu empresa.
            </p>
          </div>
          <form onSubmit={handleSubmit} className={`grid gap-4 ${shakeError ? 'animate-shake' : ''}`}>
            {/* --- Datos Personales --- */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nombre</Label>
                <Input
                  ref={firstNameRef}
                  id="first-name"
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  onBlur={() => handleFieldBlur('firstName')}
                  disabled={loading}
                  className={`bg-zinc-900 border-zinc-700 text-white focus:border-white transition-all ${
                    errors.firstName ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  aria-required="true"
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-red-500 text-sm mt-1 animate-fadeIn" role="alert">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input
                  ref={lastNameRef}
                  id="last-name"
                  placeholder="Pérez"
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  onBlur={() => handleFieldBlur('lastName')}
                  disabled={loading}
                  className={`bg-zinc-900 border-zinc-700 text-white focus:border-white transition-all ${
                    errors.lastName ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  aria-required="true"
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-red-500 text-sm mt-1 animate-fadeIn" role="alert">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                ref={emailRef}
                id="email"
                type="text"
                placeholder="nombre@empresa.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                disabled={loading}
                autoComplete="email"
                className={`bg-zinc-900 border-zinc-700 text-white focus:border-white transition-all ${
                  errors.email ? 'border-red-500 focus:border-red-500' : ''
                }`}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-required="true"
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1 animate-fadeIn" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  disabled={loading}
                  className={`bg-zinc-900 border-zinc-700 text-white focus:border-white transition-all pr-10 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-500 text-sm mt-1 animate-fadeIn" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            <hr className="border-zinc-700 my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="company-name">Nombre de la Empresa</Label>
                <Input
                  ref={companyNameRef}
                  id="company-name"
                  placeholder="Textiles Andinos S.A.C."
                  value={formData.companyName}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                  onBlur={() => handleFieldBlur('companyName')}
                  disabled={loading}
                  className={`bg-zinc-900 border-zinc-700 text-white focus:border-white transition-all ${
                    errors.companyName ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={errors.companyName ? 'true' : 'false'}
                  aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                  aria-required="true"
                />
                {errors.companyName && (
                  <p id="companyName-error" className="text-red-500 text-sm mt-1 animate-fadeIn" role="alert">
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-ruc">RUC</Label>
                <Input
                  ref={companyRucRef}
                  id="company-ruc"
                  placeholder="20123456789"
                  value={formData.companyRuc}
                  onChange={(e) => handleFieldChange('companyRuc', e.target.value)}
                  onBlur={() => handleFieldBlur('companyRuc')}
                  disabled={loading}
                  className={`bg-zinc-900 border-zinc-700 text-white focus:border-white transition-all ${
                    errors.companyRuc ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={errors.companyRuc ? 'true' : 'false'}
                  aria-describedby={errors.companyRuc ? 'companyRuc-error' : undefined}
                  aria-required="true"
                />
                {errors.companyRuc && (
                  <p id="companyRuc-error" className="text-red-500 text-sm mt-1 animate-fadeIn" role="alert">
                    {errors.companyRuc}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-phone">Teléfono</Label>
                <Input
                  ref={companyPhoneRef}
                  id="company-phone"
                  placeholder="+51 987654321"
                  value={formData.companyPhone}
                  onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
                  onBlur={() => handleFieldBlur('companyPhone')}
                  disabled={loading}
                  className={`bg-zinc-900 border-zinc-700 text-white focus:border-white transition-all ${
                    errors.companyPhone ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={errors.companyPhone ? 'true' : 'false'}
                  aria-describedby={errors.companyPhone ? 'companyPhone-error' : undefined}
                  aria-required="true"
                />
                {errors.companyPhone && (
                  <p id="companyPhone-error" className="text-red-500 text-sm mt-1 animate-fadeIn" role="alert">
                    {errors.companyPhone}
                  </p>
                )}
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="company-address">Dirección</Label>
                <Input
                  ref={companyAddressRef}
                  id="company-address"
                  placeholder="Av. Principal 123, Lima"
                  value={formData.companyAddress}
                  onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
                  onBlur={() => handleFieldBlur('companyAddress')}
                  disabled={loading}
                  className={`bg-zinc-900 border-zinc-700 text-white focus:border-white transition-all ${
                    errors.companyAddress ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={errors.companyAddress ? 'true' : 'false'}
                  aria-describedby={errors.companyAddress ? 'companyAddress-error' : undefined}
                  aria-required="true"
                />
                {errors.companyAddress && (
                  <p id="companyAddress-error" className="text-red-500 text-sm mt-1 animate-fadeIn" role="alert">
                    {errors.companyAddress}
                  </p>
                )}
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
              className="w-full bg-white text-black hover:bg-gray-200 font-semibold transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-white focus:outline-none"
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
        <div className="relative z-10 text-center text-white animate-fadeIn">
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