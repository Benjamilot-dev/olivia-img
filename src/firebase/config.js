import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  get,
  update
} from 'firebase/database';

// Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyAw-JoOD_pJm9ryRnkMT88KGKY211sjTwY",
  authDomain: "oliviathecatimg.firebaseapp.com",
  databaseURL: "https://oliviathecatimg-default-rtdb.firebaseio.com",
  projectId: "oliviathecatimg",
  storageBucket: "oliviathecatimg.firebasestorage.app",
  messagingSenderId: "593469981599",
  appId: "1:593469981599:web:4f5f2652c896dc5bb633aa"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Google Sign-In
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    let friendlyMessage = error.message;
    if (error.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Ventana de inicio de sesión de Google cerrada antes de completar.';
    } else if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage = 'Dominio no autorizado. En la consola de Firebase: Authentication ➔ Configuración ➔ Dominios autorizados (agrega localhost si es necesario).';
    } else if (error.code === 'auth/popup-blocked') {
      friendlyMessage = 'El navegador bloqueó la ventana emergente de Google. Por favor permite las ventanas emergentes.';
    }
    return { user: null, error: friendlyMessage, code: error.code };
  }
};

// Sign Out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error: error.message };
  }
};
