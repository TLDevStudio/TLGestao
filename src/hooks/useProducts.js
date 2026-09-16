import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeProducts } from "../services/productService";
import { useDebounce } from "./useDebounce";

export function useProducts({ search = "", category = "all", onlyLowStock = false } = {}) {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = subscribeProducts(
            user.uid,
            (list) => {
                setProducts(list);
                setLoading(false);
            },
            () => {
                setError("Não foi possível carregar os produtos.");
                setLoading(false);
            }
        );
        return unsubscribe;
    }, [user]);

    const categories = useMemo(() => {
        const set = new Set(products.map((p) => p.category).filter(Boolean));
        return Array.from(set).sort();
    }, [products]);

    const lowStockCount = useMemo(
        () => products.filter((p) => Number(p.stock) <= Number(p.minStock ?? 0)).length,
        [products]
    );

    const filteredProducts = useMemo(() => {
        const term = debouncedSearch.trim().toLowerCase();
        return products.filter((p) => {
            const matchesTerm =
                !term ||
                p.name.toLowerCase().includes(term) ||
                (p.sku || "").toLowerCase().includes(term);
            const matchesCategory = category === "all" || p.category === category;
            const matchesLowStock = !onlyLowStock || Number(p.stock) <= Number(p.minStock ?? 0);
            return matchesTerm && matchesCategory && matchesLowStock;
        });
    }, [products, debouncedSearch, category, onlyLowStock]);

    return {
        products: filteredProducts,
        allProductsCount: products.length,
        categories,
        lowStockCount,
        loading,
        error,
    };
}
