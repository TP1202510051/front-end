import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  type AuthError,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

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

// export const testFirestoreWrite = async () => {
//   console.log('Iniciando prueba de escritura en Firestore...');
//   try {
//     // Intentamos escribir un documento simple en una colección de prueba
//     const testDocRef = doc(db, 'testCollection', 'testDocument');
//     await setDoc(testDocRef, {
//       testField: '¡Hola, Firestore!',
//       timestamp: new Date(),
//     });
//     console.log('ÉXITO: La escritura en Firestore se completó correctamente.');
//     alert('Prueba de escritura exitosa. Revisa la consola y tu Firestore.');
//   } catch (error) {
//     console.error('ERROR: La prueba de escritura en Firestore falló.', error);
//     alert('La prueba de escritura falló. Revisa la consola para ver el error.');
//   }
// };

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
      password,
    );
    const user = userCredential.user;

    // 2. Crear el objeto de perfil sin el email (ya que está en el nivel superior)
    const profileData = {
      uid: user.uid,
      firstName: userData.firstName || '', // Si es undefined, usa ''
      lastName: userData.lastName || '', // Si es undefined, usa ''
      email: userData.email, // El email siempre existirá
      company: {
        name: userData.company?.name || '', // El '?.' evita error si 'company' no existe
        ruc: userData.company?.ruc || '',
        address: userData.company?.address || '',
        phone: userData.company?.phone || '',
      },
      profilePictureUrl: '',
      companyLogoUrl: '',
    };

    // 3. Guardar los datos del perfil en una colección "users" en Firestore
    //    usando el UID del usuario como ID del documento.
    console.log('UID del usuario antes de escribir:', user.uid);
    console.log('Datos del usuario antes de escribir:', profileData);
    await setDoc(doc(db, 'users', user.uid), profileData);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};
