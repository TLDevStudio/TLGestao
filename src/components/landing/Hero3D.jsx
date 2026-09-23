import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* Cores da marca (mesmos tokens do index.css) */
const COLOR = {
    pine950: 0x0d1f1a,
    pine700: 0x244d42,
    pine600: 0x2f6355,
    amber500: 0xe8a33d,
    amber600: 0xd38f2b,
};

/* Largura máxima do bloco de texto do hero (max-w-4xl = 56rem = 896px) */
const TEXT_WIDTH = 896;
/* Ajustes do layout no desktop (em px de CSS) */
const SIDE_MARGIN = 56; // folga mínima entre a peça e a borda da tela
const TEXT_GAP = -12; // folga até o texto (negativo = pode entrar no padding do texto)
const HALF_WIDTH_RATIO = 0.66; // meia-largura visível da peça ÷ altura (inclui giro/perspectiva)

/* Altura "natural" de cada peça em unidades 3D (usada para escalar em px) */
const CLUSTER_HEIGHT = 3;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/* Texturas */

/** "R$" gravado na face da moeda. Redesenha quando a fonte da marca carregar. */
function makeGlyphTexture() {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    const draw = () => {
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = "#9a6210";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "700 120px 'Space Grotesk', Inter, system-ui, sans-serif";
        ctx.fillText("R$", size / 2, size / 2 + 6);
        texture.needsUpdate = true;
    };

    draw();
    try {
        document.fonts?.load("700 120px 'Space Grotesk'").then(draw).catch(() => { });
    } catch {
        /* sem suporte a document.fonts: segue com a fonte reserva */
    }
    return texture;
}

/** Sombra suave (elipse) para "ancorar" as peças flutuando. */
function makeShadowTexture() {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(13,31,26,0.55)");
    grad.addColorStop(1, "rgba(13,31,26,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

/* Peças */

function createMaterials(glyphTexture) {
    return {
        plate: new THREE.MeshStandardMaterial({ color: COLOR.pine950, roughness: 0.5, metalness: 0.15 }),
        pine: new THREE.MeshStandardMaterial({ color: COLOR.pine600, roughness: 0.38, metalness: 0.2 }),
        amber: new THREE.MeshStandardMaterial({ color: COLOR.amber500, roughness: 0.3, metalness: 0.9 }),
        amberDark: new THREE.MeshStandardMaterial({ color: COLOR.amber600, roughness: 0.35, metalness: 0.9 }),
        glyph: new THREE.MeshStandardMaterial({
            map: glyphTexture,
            transparent: true,
            roughness: 0.4,
            metalness: 0.7,
            depthWrite: false,
        }),
    };
}

/** Uma moeda deitada (eixo Y). Face de cima com aro e "R$". */
function buildCoin(mats, { r = 0.7, h = 0.17 } = {}) {
    const coin = new THREE.Group();

    coin.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64), mats.amber));

    [1, -1].forEach((side) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.84, 0.024, 12, 72), mats.amberDark);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = side * (h / 2);
        coin.add(ring);
    });

    const face = new THREE.Mesh(new THREE.CircleGeometry(r * 0.72, 48), mats.glyph);
    face.rotation.x = -Math.PI / 2;
    face.position.y = h / 2 + 0.003;
    coin.add(face);

    return coin;
}


function criarPilhaDeMoedas(mats) {
    const group = new THREE.Group();

    const pilha = (count, x, z, r, seed) => {
        const h = 0.17 * (r / 0.7);
        for (let i = 0; i < count; i++) {
            const coin = buildCoin(mats, { r, h });
            coin.position.set(
                x + Math.sin(i * 2.3 + seed) * 0.035,
                -1.1 + h / 2 + i * (h + 0.012),
                z + Math.cos(i * 1.7 + seed) * 0.035
            );
            coin.rotation.y = i * 0.6 + seed;
            coin.rotation.z = Math.sin(i + seed) * 0.02;
            group.add(coin);
        }
    };

    stack(6, -0.4, 0.1, 0.7, 0);
    stack(3, 0.95, 0.45, 0.58, 2);

    // Moeda em pé, girando sobre a pilha
    const flip = new THREE.Group();
    const standing = buildCoin(mats, { r: 0.72, h: 0.18 });
    standing.rotation.x = Math.PI / 2;
    flip.add(standing);
    flip.position.set(-0.4, 1.0, 0.1);
    group.add(flip);

    // Centraliza o conjunto no próprio eixo
    group.position.set(-0.2, -0.3, 0);
    const holder = new THREE.Group();
    holder.add(group);

    return { object: holder, flip };
}

/** Gráfico de barras crescente com linha de tendência e seta. */
function buildChart(mats) {
    const group = new THREE.Group();
    const baseY = -1.15;

    const plate = new THREE.Mesh(new RoundedBoxGeometry(2.9, 0.16, 1.5, 4, 0.06), mats.plate);
    plate.position.y = baseY;
    group.add(plate);

    const heights = [0.65, 1.0, 0.85, 1.45, 2.0];
    const w = 0.42;
    const gap = 0.15;
    const total = heights.length * w + (heights.length - 1) * gap;
    const bars = [];
    const points = [];

    heights.forEach((h, i) => {
        const x = -total / 2 + w / 2 + i * (w + gap);
        const isLast = i === heights.length - 1;

        // "pivot" fica na base da barra para a animação de crescimento
        const pivot = new THREE.Group();
        pivot.position.set(x, baseY + 0.08, 0);

        const bar = new THREE.Mesh(
            new RoundedBoxGeometry(w, h, 0.8, 4, 0.05),
            isLast ? mats.amber : mats.pine
        );
        bar.position.y = h / 2;
        pivot.add(bar);
        group.add(pivot);
        bars.push(pivot);

        points.push(new THREE.Vector3(x, baseY + 0.08 + h + 0.3 + i * 0.05, 0));
    });

    // Linha de tendência
    const curve = new THREE.CatmullRomCurve3(points);
    const lineGeo = new THREE.TubeGeometry(curve, 80, 0.035, 8, false);
    const line = new THREE.Mesh(lineGeo, mats.amber);
    group.add(line);

    // Ponta de seta no fim da linha
    const end = curve.getPoint(1);
    const tangent = curve.getTangent(1).normalize();
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 20), mats.amber);
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    arrow.position.copy(end).addScaledVector(tangent, 0.1);
    arrow.scale.setScalar(0.001);
    group.add(arrow);

    group.position.set(0, -0.3, 0);
    const holder = new THREE.Group();
    holder.add(group);

    return { object: holder, bars, line, arrow };
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function Hero3D() {
    const boxRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const wideMQ = window.matchMedia("(min-width: 80rem)"); // = breakpoint xl do Tailwind
        const isTouch = window.matchMedia("(pointer: coarse)").matches;

        /* ---------- Renderer ---------- */
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
            setFailed(true); // sem WebGL: some sem quebrar a página
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.setClearColor(0x000000, 0);

        const canvas = renderer.domElement;
        // Estilo inline para vencer a regra global `canvas { height: auto }` do index.css
        canvas.style.cssText = "display:block;width:100%;height:100%;";
        box.appendChild(canvas);

        /* ---------- Cena, câmera, luz ---------- */
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 1, 60);
        camera.position.set(0, 0, 13);

        const pmrem = new THREE.PMREMGenerator(renderer);
        const envScene = new RoomEnvironment();
        const envTexture = pmrem.fromScene(envScene, 0.04).texture;
        scene.environment = envTexture;
        scene.environmentIntensity = 0.9;

        const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
        key.position.set(-4, 6, 8);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xa9d9c9, 1.1);
        rim.position.set(5, 2, -4);
        scene.add(rim);

        /* ---------- Objetos ---------- */
        const glyphTexture = makeGlyphTexture();
        const shadowTexture = makeShadowTexture();
        const mats = createMaterials(glyphTexture);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.32,
            depthWrite: false,
        });

        const treasury = buildTreasury(mats);
        const chart = buildChart(mats);

        // root (posição/escala do layout) > tilt (inclinação e giro) > peça
        const makeRoot = (piece, baseRotY, phase) => {
            const root = new THREE.Group();
            const tilt = new THREE.Group();
            tilt.rotation.x = 0.3;
            tilt.add(piece);
            root.add(tilt);

            const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
            shadow.scale.set(3.4, 0.55, 1);
            shadow.position.set(0, -1.75, -0.3);
            root.add(shadow);

            scene.add(root);
            return { root, tilt, baseRotY, phase, layoutScale: 1 };
        };

        const left = makeRoot(treasury.object, 0.3, 0);
        const right = makeRoot(chart.object, -0.38, 1.7);
        const clusters = [left, right];

        /* ---------- Layout responsivo ---------- */
        const layout = () => {
            const w = box.clientWidth;
            const h = box.clientHeight;
            if (!w || !h) return false;

            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();

            const visibleH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            const worldPerPx = visibleH / h;
            const toX = (px) => (px - w / 2) * worldPerPx;
            const toY = (py) => (h / 2 - py) * worldPerPx;

            let sizePx, xLeft, xRight;
            if (wideMQ.matches) {
                // Desktop: ocupa o espaço vazio dos dois lados do texto
                const side = Math.max(0, (w - TEXT_WIDTH) / 2);
                const margin = Math.min(SIDE_MARGIN, side * 0.2);
                const band = Math.max(0, side - margin - TEXT_GAP); // faixa livre de cada lado
                sizePx = Math.min(band / (2 * HALF_WIDTH_RATIO), h * 0.72, 380);
                const centerOffset = margin + band / 2; // centro da peça, contado a partir da borda
                xLeft = centerOffset;
                xRight = w - centerOffset;
            } else {
                // Mobile/tablet: as duas peças lado a lado, centralizadas
                sizePx = Math.min(h * 0.86, w * 0.46, 300);
                xLeft = w * 0.27;
                xRight = w * 0.73;
            }
            const cy = h * 0.5;
            const scale = (sizePx * worldPerPx) / CLUSTER_HEIGHT;

            left.root.position.set(toX(xLeft), toY(cy), 0);
            right.root.position.set(toX(xRight), toY(cy), 0);
            clusters.forEach((c) => (c.layoutScale = scale));
            return true;
        };

        /* ---------- Animação ---------- */
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onPointerMove = (e) => {
            pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener("pointermove", onPointerMove, { passive: true });

        const lineIndexCount = chart.line.geometry.index.count;

        const update = (t) => {
            pointer.x += (pointer.tx - pointer.x) * 0.06;
            pointer.y += (pointer.ty - pointer.y) * 0.06;
            const scroll = Math.min(window.scrollY, 1200);

            // Entrada: as peças "brotam"
            const intro = easeOutBack(clamp01((t - 0.15) / 1.5));

            clusters.forEach((c) => {
                c.root.scale.setScalar(Math.max(0.001, c.layoutScale * intro));
                c.tilt.rotation.y =
                    c.baseRotY +
                    Math.sin(t * 0.45 + c.phase) * 0.14 +
                    pointer.x * 0.28 * (c === left ? 1 : -1) +
                    scroll * 0.0014 * (c === left ? 1 : -1);
                c.tilt.rotation.x = 0.3 + pointer.y * 0.1;
                c.tilt.position.y = Math.sin(t * 0.9 + c.phase) * 0.07;
            });

            // Moeda em pé gira sem parar
            treasury.flip.rotation.y = t * 1.1;
            treasury.flip.position.y = 1.0 + Math.sin(t * 1.3) * 0.05;

            // Barras crescem em sequência
            chart.bars.forEach((pivot, i) => {
                const p = clamp01((t - 0.35 - i * 0.12) / 0.9);
                const breathe = i === chart.bars.length - 1 && p >= 1 ? 1 + Math.sin(t * 1.6) * 0.025 : 1;
                pivot.scale.y = Math.max(0.001, easeOutCubic(p) * breathe);
            });

            // Linha de tendência se desenha e a seta aparece no fim
            const lp = clamp01((t - 1.1) / 1.0);
            const drawn = Math.floor((easeOutCubic(lp) * lineIndexCount) / 3) * 3;
            chart.line.geometry.setDrawRange(0, drawn);
            chart.arrow.scale.setScalar(Math.max(0.001, easeOutBack(clamp01((t - 2.05) / 0.4))));
        };

        let firstFrame = true;
        const draw = () => {
            renderer.render(scene, camera);
            if (firstFrame) {
                firstFrame = false;
                setReady(true);
            }
        };

        /* ---------- Loop (pausa fora da tela) ---------- */
        let raf = 0;
        let running = false;
        let startTime = 0;
        let inView = true;

        const tick = (now) => {
            if (!startTime) startTime = now;
            update((now - startTime) / 1000);
            draw();
            raf = requestAnimationFrame(tick);
        };
        const start = () => {
            if (running || reduced) return;
            running = true;
            raf = requestAnimationFrame(tick);
        };
        const stop = () => {
            running = false;
            cancelAnimationFrame(raf);
        };

        const io = new IntersectionObserver(
            ([entry]) => {
                inView = entry.isIntersecting;
                if (inView) start();
                else stop();
            },
            { threshold: 0 }
        );
        io.observe(box);

        const ro = new ResizeObserver(() => {
            if (!layout()) return;
            // sem loop (movimento reduzido): redesenha o quadro estático
            if (reduced) {
                update(10);
                draw();
            }
        });
        ro.observe(box);

        if (layout()) {
            if (reduced) {
                update(10);
                draw();
            } else if (inView) {
                start();
            }
        }

        /* ---------- Limpeza ---------- */
        return () => {
            stop();
            io.disconnect();
            ro.disconnect();
            window.removeEventListener("pointermove", onPointerMove);

            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
            });
            Object.values(mats).forEach((m) => m.dispose());
            shadowMat.dispose();
            glyphTexture.dispose();
            shadowTexture.dispose();
            envTexture.dispose();
            envScene.traverse((obj) => {
                obj.geometry?.dispose();
                obj.material?.dispose?.();
            });
            pmrem.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            canvas.remove();
        };
    }, []);

    if (failed) return null;

    return (
        <div
            ref={boxRef}
            aria-hidden="true"
            className={[
                "pointer-events-none relative h-52 w-full transition-opacity duration-[1200ms] ease-out sm:h-64",
                "xl:absolute xl:inset-0 xl:h-auto",
                ready ? "opacity-100" : "opacity-0",
            ].join(" ")}
        />
    );
}