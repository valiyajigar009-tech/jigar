"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Float,
  Environment,
  RoundedBox,
  Line,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { BlendFunction } from "postprocessing";

// ─── Subtle Mouse Tracker ─────────────────────────────────────────────────────
function useMouseParallax() {
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return mouse;
}

// ─── Ultra-thin Orbital Arc ───────────────────────────────────────────────────
function OrbitalArc({ radius, tilt, speed, color }: { radius: number; tilt: number; speed: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 0.22, 0));
    }
    return pts;
  }, [radius]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * speed * 0.15;
  });

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      <Line points={points} color={color} lineWidth={0.4} transparent opacity={0.35} />
    </group>
  );
}


// ─── Glassmorphic UI Panel ────────────────────────────────────────────────────
function GlassPanel({
  position,
  rotation,
  width,
  height,
  depth = 0.012,
  opacity = 0.08,
  delay = 0,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  depth?: number;
  opacity?: number;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(delay);

  useFrame((_, delta) => {
    t.current += delta;
    if (!meshRef.current) return;
    meshRef.current.position.y = position[1] + Math.sin(t.current * 0.4 + delay) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
      <RoundedBox args={[width, height, depth]} radius={0.04} smoothness={4}>
        <MeshTransmissionMaterial
          backside
          samples={8}
          resolution={512}
          transmission={0.96}
          roughness={0.05}
          thickness={0.4}
          ior={1.4}
          chromaticAberration={0.02}
          anisotropicBlur={0.05}
          color="#0a1628"
          attenuationColor="#7dd3fc"
          attenuationDistance={1.5}
          transparent
          opacity={opacity + 0.05}
        />
      </RoundedBox>

      {/* Edge emissive glow lines */}
      <mesh position={[0, 0, depth / 2 + 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#00c2ff" transparent opacity={0.03} />
      </mesh>
    </mesh>
  );
}

// ─── Thin Metallic Frame ──────────────────────────────────────────────────────
function MetallicFrame({
  position,
  rotation,
  size,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = clock.getElapsedTime() * 0.04;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
  });

  return (
    <group position={position} rotation={rotation} ref={meshRef}>
      <mesh>
        <torusGeometry args={[size, 0.006, 3, 80]} />
        <meshStandardMaterial
          color="#1e3a5f"
          metalness={0.95}
          roughness={0.08}
          envMapIntensity={2.5}
          emissive="#00c2ff"
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
}

// ─── Central Core Artifact ────────────────────────────────────────────────────
function CoreArtifact({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Slow magnetic parallax toward mouse with heavy damping
    groupRef.current.rotation.y += (mouse.current.x * 0.18 - groupRef.current.rotation.y) * 0.025;
    groupRef.current.rotation.x += (-mouse.current.y * 0.1 - groupRef.current.rotation.x) * 0.025;

    // Slow ambient drift rotation
    groupRef.current.rotation.y += delta * 0.06;

    // Breathing float
    groupRef.current.position.y = Math.sin(t * 0.35) * 0.08;

    if (innerRef.current) {
      innerRef.current.rotation.z += delta * 0.12;
      innerRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }

    if (outerRef.current) {
      outerRef.current.rotation.z -= delta * 0.07;
    }
  });

  return (
    <group ref={groupRef} position={[0.6, 0, 0]}>
      {/* Orbital arc rings */}
      <OrbitalArc radius={1.4} tilt={Math.PI * 0.08} speed={1.0} color="#00c2ff" />
      <OrbitalArc radius={1.7} tilt={-Math.PI * 0.15} speed={-0.7} color="#7dd3fc" />
      <OrbitalArc radius={2.0} tilt={Math.PI * 0.3} speed={0.5} color="#a855f7" />

      {/* Glass UI panels - layered depth composition */}
      <GlassPanel position={[0, 0.2, 0.1]} rotation={[0.1, -0.15, 0.05]} width={1.6} height={0.9} opacity={0.09} delay={0} />
      <GlassPanel position={[0.1, -0.15, -0.15]} rotation={[-0.08, 0.1, -0.04]} width={1.1} height={0.6} opacity={0.07} delay={1.2} />
      <GlassPanel position={[-0.3, 0.4, -0.35]} rotation={[0.05, 0.2, 0.08]} width={0.8} height={0.45} opacity={0.06} delay={2.5} />

      {/* Thin outer metallic frame */}
      <MetallicFrame position={[0, 0, 0]} rotation={[0.3, 0, 0.1]} size={1.0} />

      {/* Inner precision ring */}
      <group ref={innerRef}>
        <mesh>
          <torusGeometry args={[0.55, 0.008, 2, 60]} />
          <meshStandardMaterial
            color="#7dd3fc"
            metalness={0.7}
            roughness={0.15}
            emissive="#00c2ff"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Outer diffuse ring */}
      <group ref={outerRef}>
        <mesh>
          <torusGeometry args={[0.85, 0.004, 2, 80]} />
          <meshStandardMaterial
            color="#1e3a5f"
            metalness={0.9}
            roughness={0.05}
            emissive="#7dd3fc"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>

      {/* Central liquid glass orb */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.28, 3]} />
          <MeshTransmissionMaterial
            backside
            samples={12}
            resolution={512}
            transmission={0.98}
            roughness={0.0}
            thickness={0.6}
            ior={1.7}
            chromaticAberration={0.04}
            anisotropicBlur={0.1}
            color="#0a1628"
            attenuationColor="#00c2ff"
            attenuationDistance={0.8}
          />
        </mesh>
      </Float>

      {/* Volumetric ambient particles */}
      <Sparkles
        count={30}
        scale={3.5}
        size={0.6}
        speed={0.15}
        opacity={0.25}
        color="#7dd3fc"
        noise={0.3}
      />

      {/* Point light emanating from core */}
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#00c2ff" distance={3} decay={2} />
    </group>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene() {
  const mouse = useMouseParallax();

  return (
    <>
      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Cinematic fill lights */}
      <ambientLight intensity={0.06} color="#07111f" />
      <directionalLight position={[-4, 3, 2]} intensity={0.25} color="#1e3a5f" />
      <pointLight position={[4, 2, -2]} intensity={1.2} color="#00c2ff" distance={8} decay={2} />
      <pointLight position={[-3, -2, 3]} intensity={0.4} color="#a855f7" distance={6} decay={2} />

      {/* Main scene object */}
      <CoreArtifact mouse={mouse} />

      {/* Post-processing: Bloom + Vignette + Noise */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.7}
          mipmapBlur
        />
        <Vignette offset={0.4} darkness={0.7} blendFunction={BlendFunction.NORMAL} />
        <Noise opacity={0.018} blendFunction={BlendFunction.ADD} />
      </EffectComposer>
    </>
  );
}

// ─── Exported Component ───────────────────────────────────────────────────────
export default function DesignCore() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
