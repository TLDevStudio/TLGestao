import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "../lib/analytics";

/**
 * Componente "invisível" (não renderiza nada na tela) que avisa o
 * Google Analytics toda vez que a rota muda. Precisa ficar dentro do
 * <BrowserRouter> para ter acesso a useLocation().
 */
export default function RouteTracker() {
    const location = useLocation();

    useEffect(() => {
        trackPageview(location.pathname + location.search);
    }, [location.pathname, location.search]);

    return null;
}
