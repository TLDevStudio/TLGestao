import { useEffect, useRef, useState } from "react";

/**
 * <Reveal> — faz o elemento aparecer suavemente quando entra na tela.
 *
 * - Funciona ao rolar para BAIXO e para CIMA: o elemento sempre "chega" do
 *   lado de onde você está vindo (de baixo ao descer, de cima ao subir).
 * - Usa UM único IntersectionObserver para a página inteira (leve mesmo com
 *   dezenas de elementos).
 * - Respeita "reduzir movimento" do sistema operacional.
 *
 * Props:
 *   as        tag HTML a renderizar ("div" por padrão)
 *   delay     atraso em ms (use para escalonar itens de uma lista)
 *   variant   "up" (sobe + aparece) | "fade" (só aparece) | "scale" (sobe + cresce)
 *   distance  distância do deslocamento em px (36 por padrão)
 *   once      true = anima só na primeira vez; false = repete ao rolar
 *
 * As transições ficam no index.css (classe .reveal).
 */

const listeners = new WeakMap();
let sharedObserver = null;

function getObserver() {
    if (!sharedObserver) {
        sharedObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => listeners.get(entry.target)?.(entry));
            },
            {
                // 0 e 0.1: dois "gatilhos" evitam ficar piscando quando o elemento
                // está exatamente na borda da tela.
                threshold: [0, 0.1],
                // Dispara um pouco depois de entrar, para o efeito ser percebido.
                rootMargin: "0px 0px -8% 0px",
            }
        );
    }
    return sharedObserver;
}

const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Reveal({
    as: Tag = "div",
    delay = 0,
    variant = "up",
    distance = 36,
    once = false,
    className = "",
    style,
    children,
    ...rest
}) {
    const ref = useRef(null);
    // "below" = escondido abaixo da tela | "above" = escondido acima | "visible"
    const [state, setState] = useState(() => (reducedMotion() ? "visible" : "below"));

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (reducedMotion()) {
            setState("visible");
            return;
        }

        const observer = getObserver();

        listeners.set(el, (entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                setState("visible");
                if (once) {
                    observer.unobserve(el);
                    listeners.delete(el);
                }
            } else if (!entry.isIntersecting && !once) {
                // Saiu da tela: guarda de que lado saiu para a próxima entrada
                // vir da direção certa.
                setState(entry.boundingClientRect.top < 0 ? "above" : "below");
            }
        });

        observer.observe(el);
        return () => {
            observer.unobserve(el);
            listeners.delete(el);
        };
    }, [once]);

    return (
        <Tag
            ref={ref}
            data-state={state}
            data-variant={variant}
            className={`reveal ${className}`}
            style={{
                "--reveal-delay": `${delay}ms`,
                "--reveal-distance": `${distance}px`,
                ...style,
            }}
            {...rest}
        >
            {children}
        </Tag>
    );
}