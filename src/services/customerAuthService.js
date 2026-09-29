import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { translateAuthError as translateBusinessAuthError } from "./authService";

export async function registerCustomer({ name, email, phone, password }) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = credential;

    await updateProfile(user, { displayName: name });

    await setDoc(doc(db, COLLECTIONS.CUSTOMER_PROFILES, user.uid), {
        uid: user.uid,
        name: name.trim(),
        email,
        phone: phone || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return user;
}

export async function loginCustomer(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = credential;

    const businessSnap = await getDoc(doc(db, COLLECTIONS.BUSINESSES, user.uid));
    if (businessSnap.exists()) {
        await signOut(auth);
        const error = new Error(
            "Este e-mail pertence a uma conta de empresa. Para agendar como cliente, cadastre-se com outro e-mail."
        );
        error.code = "customer/wrong-account-type";
        throw error;
    }

    return user;
}

export async function logoutCustomer() {
    await signOut(auth);
}

export async function resetCustomerPassword(email) {
    await sendPasswordResetEmail(auth, email);
}

/** Atualiza nome/telefone do próprio perfil ("editar meus dados básicos"). */
export async function updateCustomerProfile(uid, { name, phone }) {
    await setDoc(
        doc(db, COLLECTIONS.CUSTOMER_PROFILES, uid),
        {
            name: name?.trim() || "",
            phone: phone || "",
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}

export function translateCustomerAuthError(error) {
    if (error?.code === "customer/wrong-account-type") {
        return error.message;
    }
    return translateBusinessAuthError(error);
}