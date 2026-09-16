import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuta sessão do Firebase Auth (persistência automática).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setBusiness(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Escuta o documento do negócio em tempo real, apenas do usuário logado.
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, COLLECTIONS.BUSINESSES, user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setBusiness(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [user]);

  const value = {
    user,
    business,
    loading,
    isAuthenticated: !!user,
    /**
     * Força a releitura do usuário do Firebase Auth e atualiza o estado.
     * Necessário porque updateProfile() (nome/foto) não dispara onAuthStateChanged,
     * então sem isso o Header continuaria mostrando os dados antigos até um refresh.
     */
    refreshUser: async () => {
      if (!auth.currentUser) return;
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
