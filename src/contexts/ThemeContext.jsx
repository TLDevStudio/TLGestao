import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { updatePreferences } from "../services/businessService";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const { user, business } = useAuth();
    const [theme, setThemeState] = useState("light");

    // Sincroniza com a preferência salva no Firestore assim que carregar.
    useEffect(() => {
        if (business?.theme) setThemeState(business.theme);
    }, [business?.theme]);

    // Aplica a classe no <html> — os tokens de cor (--color-paper, --color-ink, etc.)
    // têm uma variante escura definida em index.css sob ".dark".
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const setTheme = async (nextTheme) => {
        setThemeState(nextTheme); // aplica imediatamente, sem esperar o Firestore
        if (user) {
            try {
                await updatePreferences(user.uid, {
                    theme: nextTheme,
                    currency: business?.currency || "BRL",
                    timezone: business?.timezone || "America/Sao_Paulo",
                });
            } catch (err) {
                console.error("[TLGestão] Erro ao salvar tema:", err);
            }
        }
    };

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
    return ctx;
}
