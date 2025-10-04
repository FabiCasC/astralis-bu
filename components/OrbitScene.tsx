"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Orbit } from "@/src/types/Orbits";

export default function OrbitScene() {
  const [orbits, setOrbits] = useState<Orbit[]>([]);

  useEffect(() => {
    fetch("/data/orbits.json")
      .then((res) => res.json())
      .then((data: Orbit[]) => setOrbits(data));
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 200], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[50, 50, 50]} />
      <OrbitControls />

      {/* Sol */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="yellow" />
      </mesh>

      {/* Órbitas */}
      {orbits.map((orbit, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={orbit.points.length}
              array={new Float32Array(orbit.points.flat())}
              itemSize={3}
              args={[new Float32Array(orbit.points.flat()), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" />
        </line>
      ))}
    </Canvas>
  );
}
