import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { assertNotDemoAccount } from "../utils/demoGuard";
import { logActivity } from "./activityLogService";
import { createNotification } from "./notificationService";

/** Escuta em tempo real a lista de produtos do negócio, ordenada por nome. */
export function subscribeProducts(businessId, onChange, onError) {
    const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where("businessId", "==", businessId),
        orderBy("name")
    );

    return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
            console.error("[TLGestão] Erro ao escutar produtos:", err);
            onError?.(err);
        }
    );
}

/** Envia a foto do produto para o Storage e retorna a URL pública. */
async function uploadProductPhoto(businessId, file) {
    const path = `products/${businessId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

export async function createProduct(businessId, data, photoFile) {
    let photoUrl = null;
    if (photoFile) {
        photoUrl = await uploadProductPhoto(businessId, photoFile);
    }

    await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        businessId,
        name: data.name.trim(),
        sku: data.sku || "",
        category: data.category || "Outros",
        salePrice: Number(data.salePrice) || 0,
        costPrice: Number(data.costPrice) || 0,
        stock: Number(data.stock) || 0,
        minStock: Number(data.minStock) || 0,
        supplier: data.supplier || "",
        description: data.description || "",
        photoUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "product_created",
        description: `Produto "${data.name.trim()}" cadastrado`,
    });
}

export async function updateProduct(businessId, productId, data, photoFile) {
    const updates = {
        name: data.name.trim(),
        sku: data.sku || "",
        category: data.category || "Outros",
        salePrice: Number(data.salePrice) || 0,
        costPrice: Number(data.costPrice) || 0,
        minStock: Number(data.minStock) || 0,
        supplier: data.supplier || "",
        description: data.description || "",
        updatedAt: serverTimestamp(),
    };

    if (photoFile) {
        updates.photoUrl = await uploadProductPhoto(businessId, photoFile);
    }

    await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), updates);

    await logActivity(businessId, {
        action: "product_updated",
        description: `Produto "${data.name.trim()}" editado`,
    });
}

export async function deleteProduct(businessId, productId, productName, photoUrl) {
    assertNotDemoAccount(businessId);
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));

    if (photoUrl) {
        try {
            await deleteObject(ref(storage, photoUrl));
        } catch {
            // Ignora falha ao remover a imagem — não deve travar a exclusão do produto.
        }
    }

    await logActivity(businessId, {
        action: "product_deleted",
        description: `Produto "${productName}" excluído`,
    });
}

/**
 * Registra entrada ou saída de estoque de forma atômica (increment),
 * evitando condição de corrida quando várias pessoas mexem no estoque ao mesmo tempo.
 */
export async function adjustStock(businessId, product, { type, quantity, reason }) {
    const delta = type === "in" ? Number(quantity) : -Number(quantity);

    await updateDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), {
        stock: increment(delta),
        updatedAt: serverTimestamp(),
    });

    const label = type === "in" ? "Entrada" : "Saída";
    await logActivity(businessId, {
        action: "stock_adjusted",
        description: `${label} de ${quantity} unidade(s) em "${product.name}"${reason ? ` — ${reason}` : ""
            }`,
    });

    const newStock = Number(product.stock) + delta;
    if (type === "out" && newStock <= Number(product.minStock ?? 0)) {
        await createNotification(businessId, {
            type: "low_stock",
            title: "Produto com estoque baixo",
            message: `"${product.name}" está com ${newStock} unidade(s) (mínimo: ${product.minStock ?? 0})`,
        });
    }
}
