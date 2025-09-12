import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import type { UserProfileData } from "@/models/userProfileData";

// Definimos el tipo para el valor del contexto
interface AuthContextType {
  firebaseUser: User | null;           // Usuario Firebase
  profile: UserProfileData | null;     // Usuario de negocio
  idToken: string | null;
  loading: boolean;
  setAuth: (
    firebaseUser: User | null,
    profile: UserProfileData | null,
    token: string | null
  ) => void;
}

// Creamos el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

// Creamos el proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const setAuth = (
    firebaseUser: User | null,
    profile: UserProfileData | null,
    token: string | null
  ) => {
    setFirebaseUser(firebaseUser);
    setProfile(profile);
    setIdToken(token);
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, idToken, loading, setAuth }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}