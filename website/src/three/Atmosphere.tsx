import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Ambient WebGL atmosphere rendered behind the whole page: a field of warm
 * golden dust motes drifting upward, plus a soft pointer-driven camera parallax.
 *
 * The visual style of the site is hand-drawn parchment, so this stays subtle —
 * it adds depth and life without competing with the illustrations. It is fully
 * disabled on reduced-motion / small screens (a static CSS gradient covers
 * those cases) and pauses when the tab is hidden.
 */

const DUST_COUNT = 720;

function makeSprite(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255, 232, 186, 1)");
  g.addColorStop(0.35, "rgba(214, 158, 92, 0.55)");
  g.addColorStop(1, "rgba(214, 158, 92, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function DustField() {
  const pointsRef = useRef<THREE.Points>(null);
  const sprite = useMemo(makeSprite, []);

  const { positions, speeds, sway } = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3);
    const speeds = new Float32Array(DUST_COUNT);
    const sway = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      speeds[i] = 0.06 + Math.random() * 0.14;
      sway[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, sway };
  }, []);

  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);
    for (let i = 0; i < DUST_COUNT; i++) {
      const iy = i * 3 + 1;
      arr[iy] += speeds[i] * d;
      arr[i * 3] += Math.sin(t * 0.4 + sway[i]) * 0.0016;
      if (arr[iy] > 8.5) {
        arr[iy] = -8.5;
        arr[i * 3] = (Math.random() - 0.5) * 26;
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.z = Math.sin(t * 0.05) * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.42}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={new THREE.Color("#e8c184")}
      />
    </points>
  );
}

function ParallaxRig() {
  const pointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    camera.position.x += (pointer.current.x * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (-pointer.current.y * 0.6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Atmosphere() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 760px)").matches;
    if (reduce || small) {
      setActive(false);
      return;
    }
    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div className="atmosphere" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 12], fov: 55 }}
      >
        <DustField />
        <ParallaxRig />
      </Canvas>
    </div>
  );
}
