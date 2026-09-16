import { useEffect, useState } from "react";

/** Retorna uma versão "atrasada" do valor, útil para pesquisas com debounce. */
export function useDebounce(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
