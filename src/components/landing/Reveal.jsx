import { useEffect, useRef, useState } from "react";

const listeners = new WeakMap();
let sharedObserver = null;

function getObserver() {
    if (!sharedObserver) {
        sharedObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => listeners.get(entry.target)?.(entry));
            },
            {
                threshold: [0, 0.1],
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