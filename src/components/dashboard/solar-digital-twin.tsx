"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  OrbitControls, 
  Float, 
  MeshDistortMaterial, 
  Stars, 
  Sparkles,
  Text 
} from '@react-three/drei';
import * as THREE from 'three';

interface SolarDigitalTwinProps {
  lightIndex: number;
  voltage: number;
  power: number;
  temperature: number;
  dustIndex: number;
}

const SolarPanelModel = ({ lightIndex, voltage, power, temperature, dustIndex }: SolarDigitalTwinProps) => {
  const panelRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Map sensor data to 3D visual properties
  const normalizedLight = Math.min(lightIndex / 1000, 1.2);
  const normalizedPower = Math.min(power / 10, 1);
  const normalizedDust = Math.min(dustIndex / 500, 0.8);
  
  // Color shift based on temperature (Cyan -> Warm White/Yellow)
  const baseColor = new THREE.Color("#22D3EE");
  const warmColor = new THREE.Color("#FDE68A");
  const targetColor = baseColor.clone().lerp(warmColor, Math.min((temperature - 20) / 40, 1));

  useFrame((state) => {
    if (panelRef.current) {
      // Gentle floating/hover effect
      panelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      panelRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={panelRef}>
      {/* Main Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[4.2, 2.2, 0.1]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Solar Surface */}
      <mesh>
        <planeGeometry args={[4, 2]} />
        <meshPhysicalMaterial
          ref={materialRef}
          color={targetColor}
          emissive={targetColor}
          emissiveIntensity={normalizedLight * 0.5}
          metalness={0.9}
          roughness={0.1 + normalizedDust}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2}
          thickness={0.5}
        />
      </mesh>

      {/* Grid Lines */}
      <gridHelper 
        args={[4, 10, 0x22D3EE, 0x22D3EE]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0, 0.01]} 
      />

      {/* Energy Flow Glow - Pulsing Edges */}
      {power > 0 && (
        <Sparkles 
          count={Math.floor(power * 20)} 
          scale={4.5} 
          size={2} 
          speed={0.5} 
          color="#22D3EE" 
          opacity={normalizedPower}
        />
      )}
    </group>
  );
};

const LightRays = ({ intensity }: { intensity: number }) => {
  const raysRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (raysRef.current) {
      raysRef.current.children.forEach((ray, i) => {
        (ray as THREE.Mesh).position.y = -((state.clock.elapsedTime * (1 + i * 0.1)) % 10);
      });
    }
  });

  return (
    <group ref={raysRef} position={[0, 10, 2]} rotation={[Math.PI / 4, 0, 0]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[(i - 2) * 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 20]} />
          <meshBasicMaterial 
            color="#FACC15" 
            transparent 
            opacity={intensity * 0.2} 
          />
        </mesh>
      ))}
    </group>
  );
};

export function SolarDigitalTwin(props: SolarDigitalTwinProps) {
  return (
    <div className="w-full h-[400px] relative rounded-3xl overflow-hidden bg-[#0a0f19] border border-white/5 shadow-2xl">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-white font-bold text-lg tracking-tight">Solar Panel Digital Twin</h3>
        <p className="text-slate-400 text-xs flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22D3EE]"></span>
          </span>
          Live WebGL Simulation
        </p>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
        <OrbitControls 
          enableZoom={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2}
        />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={props.lightIndex / 500} color="#FACC15" />
        <spotLight 
          position={[-10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={props.power / 2} 
          color="#22D3EE" 
        />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <SolarPanelModel {...props} />
        </Float>

        <LightRays intensity={props.lightIndex / 1000} />

        {/* Dynamic Label */}
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.2}
          color="white"
          font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          fillOpacity={0.5}
        >
          {`${props.voltage.toFixed(2)}V | ${props.power.toFixed(2)}W | ${props.temperature.toFixed(1)}°C`}
        </Text>
      </Canvas>
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#22D3EE]/5 to-transparent"></div>
    </div>
  );
}
