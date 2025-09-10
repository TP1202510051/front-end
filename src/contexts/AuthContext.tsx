// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// Definimos el tipo para el valor del contexto
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

// Creamos el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

// Creamos el proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es un observador que se ejecuta
    // cada vez que el estado de autenticación cambia.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Nos desuscribimos del observador cuando el componente se desmonta
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  // No renderizamos nada hasta que se cargue el estado del usuario
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}