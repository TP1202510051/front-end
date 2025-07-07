import { 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  type AuthError
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase";

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  company: {
    name: string;
    ruc: string;
    address: string;
    phone: string;
  };
}

// --- Función de Login ---
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    // Devolvemos un objeto con el error para manejarlo en el componente
    return { user: null, error: error as AuthError };
  }
};

// --- Función de Logout ---
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
};

export const register = async (userData: UserProfileData, password: string) => {
  try {
    // 1. Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      password
    );
    const user = userCredential.user;

    // 2. Crear el objeto de perfil sin el email (ya que está en el nivel superior)
    const profileData = {
      uid: user.uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email, // Guardamos el email para facilitar consultas
      company: userData.company,
      profilePictureUrl: null, // Valor inicial
      companyLogoUrl: null,    // Valor inicial
    };

    // 3. Guardar los datos del perfil en una colección "users" en Firestore
    //    usando el UID del usuario como ID del documento.
    await setDoc(doc(db, "users", user.uid), profileData);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};