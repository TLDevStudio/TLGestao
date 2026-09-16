import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

/**
 * Cria a conta no Firebase Authentication e o documento correspondente
 * em `businesses/{uid}` com os dados da empresa do usuário.
 * Cada usuário só enxerga o próprio negócio (isolamento por uid).
 */
export async function registerBusiness({
  name,
  businessName,
  email,
  phone,
  password,
  businessType,
}) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, COLLECTIONS.BUSINESSES, user.uid), {
    ownerId: user.uid,
    ownerName: name,
    businessName,
    email,
    phone,
    businessType,
    logoUrl: null,
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    theme: "light",
    onboarding: {
      companyConfigured: true,
      servicesCreated: false,
      clientsCreated: false,
      firstUseDone: false,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/** Traduz códigos de erro do Firebase para mensagens amigáveis em português. */
export function translateAuthError(error) {
  const code = error?.code || "";
  const map = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um momento e tente novamente.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  };
  return map[code] || "Não foi possível concluir a operação. Tente novamente.";
}
