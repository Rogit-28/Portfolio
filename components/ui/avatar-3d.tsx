"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface AvatarMeshProps {
  mousePosition: { x: number; y: number };
  isMobile: boolean;
}

function AvatarMesh({ mousePosition, isMobile }: AvatarMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!groupRef.current) return;

    if (isMobile) {
      // Idle animation for mobile - subtle looking around
      targetRotation.current.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.25;
      targetRotation.current.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    } else {
      // Cursor tracking for desktop
      targetRotation.current.x = mousePosition.y * 0.3;
      targetRotation.current.y = mousePosition.x * 0.5;
    }

    // Smooth interpolation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.current.x,
      0.08
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation.current.y,
      0.08
    );
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Head - main shape */}
        <mesh position={[0, 0.1, 0]}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#1a1a1a"
            flatShading
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Accent ring around head */}
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.03, 8, 32]} />
          <meshStandardMaterial
            color="#DC2626"
            emissive="#DC2626"
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Left eye */}
        <mesh position={[-0.35, 0.25, 0.75]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial
            color="#DC2626"
            emissive="#DC2626"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Right eye */}
        <mesh position={[0.35, 0.25, 0.75]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial
            color="#DC2626"
            emissive="#DC2626"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Neck/base */}
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 0.5, 8]} />
          <meshStandardMaterial
            color="#1a1a1a"
            flatShading
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Shoulder hint */}
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[1.8, 0.3, 0.8]} />
          <meshStandardMaterial
            color="#1a1a1a"
            flatShading
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Accent line on shoulder */}
        <mesh position={[0, -1.0, 0.45]}>
          <boxGeometry args={[1.6, 0.04, 0.04]} />
          <meshStandardMaterial
            color="#DC2626"
            emissive="#DC2626"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function Avatar3D() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Track mouse position (normalized -1 to 1)
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = -(e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  return (
    <div className="w-40 h-40 md:w-48 md:h-48">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#DC2626" />
        <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffffff" />
        
        <AvatarMesh mousePosition={mousePosition} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
