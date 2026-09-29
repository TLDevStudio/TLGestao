import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

export const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [customerProfile, setCustomerProfile] = useState(null);
    const [isBusinessAccount, setIsBusinessAccount] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (!firebaseUser) {
                setCustomerProfile(null);
                setIsBusinessAccount(false);
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    // Escuta o perfil do cliente em tempo real.
    useEffect(() => {
        if (!user) return;

        const profileRef = doc(db, COLLECTIONS.CUSTOMER_PROFILES, user.uid);
        const unsubscribeProfile = onSnapshot(
            profileRef,
            (snap) => {
                setCustomerProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
                setLoading(false);
            },
            () => setLoading(false)
        );

        getDoc(doc(db, COLLECTIONS.BUSINESSES, user.uid))
            .then((snap) => setIsBusinessAccount(snap.exists()))
            .catch(() => setIsBusinessAccount(false));

        return unsubscribeProfile;
    }, [user]);

    const value = {
        user,
        customerProfile,
        isBusinessAccount,
        loading,
        isAuthenticated: !!user,
        hasCompletedProfile: !!customerProfile,
    };

    return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}