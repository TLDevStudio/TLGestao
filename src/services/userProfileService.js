import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

/** Atualiza o nome de exibição do usuário no Firebase Authentication. */
export async function updateUserName(user, name) {
    await updateProfile(user, { displayName: name.trim() });
}

/** Envia a foto de perfil e atualiza o photoURL do usuário. */
export async function uploadUserAvatar(user, file) {
    const path = `avatars/${user.uid}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL });
    return photoURL;
}
