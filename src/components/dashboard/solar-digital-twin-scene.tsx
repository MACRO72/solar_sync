"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  MeshDistortMaterial, 
  Sparkles,
  Sky,
  Stars,
  Environment,
  Box,
  Cylinder,
  Text,
  Cloud,
  Clouds
} from '@react-three/drei';
import * as THREE from 'three';
import { Zap, Sun, Thermometer, Info, AlertTriangle, CheckCircle2, Moon } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface SolarDigitalTwinProps {
  lightIndex: number;
  voltage: number;
  power: number;
  temperature: number;
  dustIndex: number;
}

const DEFAULT_TILT_DEG = 30; // degrees
const TILT_ANGLE = (DEFAULT_TILT_DEG * Math.PI) / 180;
const PANEL_WIDTH = 4.2;
const PANEL_HEIGHT = 2.4;

// Centralized simulation driver mapped exactly to the real-world 24-hour clock
const getSimProgress = () => {
  const now = new Date();
  const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  return secondsSinceMidnight / 86400; // 0 (midnight) to 1 (midnight)
};

// Standard Materials mimicking real outdoor weathering as functional components to prevent React Element reuse crashes
const AluminumMaterial = () => <meshStandardMaterial color="#b0b5b9" metalness={0.8} roughness={0.3} />;
const ConcreteMaterial = () => <meshStandardMaterial color="#888c8d" roughness={0.9} metalness={0.1} />;
const RubberMaterial = () => <meshStandardMaterial color="#1a1a1a" roughness={0.9} />;
const InverterMaterial = () => <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.6} />;
const GroundMaterial = () => <meshStandardMaterial color="#2d3330" roughness={0.95} metalness={0.05} />;

const calculateExpectedPower = (progress: number) => {
  // progress 0 = midnight, 0.5 = noon, 1.0 = midnight
  const angle = (progress - 0.25) * 2 * Math.PI;
  // Panel is tilted back slightly. 
  // A purely mathematical dot-product simplification:
  const incidence = Math.sin(angle); // 0 at dawn (6am), 1 at noon, 0 at dusk (6pm)
  return incidence > 0 ? incidence * 20.0 : 0; // 20W max
};

const SolarPanelModel = React.memo(({ temperature, dustIndex, power, expectedPower }: SolarDigitalTwinProps & { expectedPower: number }) => {
  const panelRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  const activeTilt = TILT_ANGLE;
  
  const tempScale = Math.max(0, ((temperature || 0) - 25) / 50);
  const dustFactor = Math.min((dustIndex || 0) / 100, 1.0); 
  
  const isActive = power > 0;
  
  useFrame((state) => {
    if (panelRef.current) {
      panelRef.current.position.y = 1.3 + Math.sin(state.clock.elapsedTime * 15) * 0.0005;
    }
    // Pulse glow based on actual power
    if (glowRef.current) {
      const targetOpacity = isActive ? 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2 : 0;
      glowRef.current.opacity = THREE.MathUtils.lerp(glowRef.current.opacity, targetOpacity, 0.1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* GROUND MOUNTING STRUCTURE */}
      <group position={[0, 0.1, 0]}>
        <Box args={[0.5, 0.25, 2.2]} position={[-1.6, 0, 0]} castShadow receiveShadow>
          <ConcreteMaterial />
        </Box>
        <Box args={[0.5, 0.25, 2.2]} position={[1.6, 0, 0]} castShadow receiveShadow>
          <ConcreteMaterial />
        </Box>

        {/* Base Rails (Aluminum) */}
        <Box args={[3.4, 0.05, 0.1]} position={[0, 0.15, -0.9]} castShadow receiveShadow><AluminumMaterial /></Box>
        <Box args={[3.4, 0.05, 0.1]} position={[0, 0.15, 0.9]} castShadow receiveShadow><AluminumMaterial /></Box>

        {/* Support Struts */}
        <Cylinder args={[0.04, 0.04, 0.6]} position={[-1.6, 0.45, 0.9]} castShadow receiveShadow><AluminumMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 0.6]} position={[1.6, 0.45, 0.9]} castShadow receiveShadow><AluminumMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 1.67]} position={[-1.6, 0.985, -0.9]} castShadow receiveShadow><AluminumMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 1.67]} position={[1.6, 0.985, -0.9]} castShadow receiveShadow><AluminumMaterial /></Cylinder>
      </group>

      {/* TILTED PANEL ASSEMBLY */}
      <group position={[0, 1.3, 0]} rotation={[activeTilt, 0, 0]} ref={panelRef}>
        
        {/* Outer Heavy Aluminum Frame */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[PANEL_WIDTH + 0.15, 0.1, PANEL_HEIGHT + 0.15]} />
          <AluminumMaterial />
        </mesh>

        {/* Backsheet */}
        <mesh receiveShadow castShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[PANEL_WIDTH, 0.02, PANEL_HEIGHT]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>

        {/* PV Glass Array (Dark Silicon with subtle grid traces) */}
        <mesh receiveShadow castShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[PANEL_WIDTH, 0.015, PANEL_HEIGHT]} />
          <meshPhysicalMaterial
            color={isActive ? "#0a1324" : "#05080f"} // Dulls out if dead
            metalness={0.9}
            roughness={0.1 + dustFactor * 0.7}
            clearcoat={1.0 - dustFactor * 0.9} // Dust severely ruins clearcoat
            clearcoatRoughness={0.05 + dustFactor}
            envMapIntensity={2.5}
            specularIntensity={1.5}
          />
        </mesh>

        {/* Silver grid/busbar traces (Simulation of Mono-crystalline cells) */}
        <gridHelper 
          args={[PANEL_WIDTH, 14, 0x94a3b8, isActive ? 0x64748b : 0x334155]} 
          position={[0, 0.06, 0]} 
          scale={[1, 1, PANEL_HEIGHT / PANEL_WIDTH]}
        />

        {/* Power Glow Feedback */}
        <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
          <meshBasicMaterial ref={glowRef} color="#38bdf8" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* Heavy Junction Box on the back */}
        <mesh position={[0, -0.1, -0.8]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.15, 0.3]} />
          <RubberMaterial />
        </mesh>

        {/* Intense Temperature Heat Shimmer Layer */}
        {tempScale > 0.1 && (
          <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT, 64, 64]} />
            <MeshDistortMaterial
              color="#ffffff"
              transparent
              transmission={0.95} 
              opacity={1}
              ior={1.1} // Low index for air shimmer
              distort={tempScale * 1.5}
              speed={tempScale * 12}
              thickness={0.5}
              roughness={0}
            />
          </mesh>
        )}
      </group>
    </group>
  );
});

// Atmosphere helper to isolate Sky re-renders from the main EnvironmentSystem
const DynamicSky = React.memo(() => {
  const skyRef = useRef<any>(null);
  
  useFrame(() => {
    if (!skyRef.current || !skyRef.current.material) return;
    const progress = getSimProgress();
    const angle = (progress - 0.25) * 2 * Math.PI;
    const distance = 80;
    const x = Math.cos(angle) * distance; 
    const y = Math.sin(angle) * distance; 
    const z = -30;
    
    // Correctly mutate the shader uniform directly for butter-smooth movement
    const uniforms = skyRef.current.material.uniforms;
    if (uniforms && uniforms.sunPosition) {
      uniforms.sunPosition.value.set(x, y, z);
    }
  });

  return <Sky ref={skyRef} turbidity={0.6} rayleigh={1.5} mieCoefficient={0.005} mieDirectionalG={0.8} />;
});

// Animated Sun & Sky System synced to real time
const EnvironmentSystem = () => {
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const fogRef = useRef<THREE.Fog>(null);
  const starsRef = useRef<THREE.Points>(null);
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const progress = getSimProgress();
    const angle = (progress - 0.25) * 2 * Math.PI;
    const distance = 80;
    const x = Math.cos(angle) * distance; 
    const y = Math.sin(angle) * distance; 
    const z = -30;
    const mx = Math.cos(angle + Math.PI) * distance;
    const my = Math.sin(angle + Math.PI) * distance;

    const isDaytime = y > -5;

    if (sunLightRef.current) {
        sunLightRef.current.position.set(x, y, z);
        const heightRatio = Math.max(0, Math.min(y / 40, 1.0));
        sunLightRef.current.intensity = isDaytime ? Math.max(0, 0.5 + heightRatio * 3.0) : 0;
        sunLightRef.current.color.lerpColors(new THREE.Color("#ffeedd"), new THREE.Color("#ffffff"), heightRatio);
    }

    if (moonLightRef.current) {
        moonLightRef.current.position.set(mx, my, z);
        moonLightRef.current.intensity = !isDaytime ? 1.5 : 0;
    }

    if (ambientLightRef.current) ambientLightRef.current.intensity = isDaytime ? 0.6 : 0.2;
    if (hemiLightRef.current) hemiLightRef.current.intensity = isDaytime ? 0.8 : 0.3;

    if (sunMeshRef.current) {
      sunMeshRef.current.position.set(x, y, z);
      sunMeshRef.current.visible = isDaytime;
    }
    if (moonMeshRef.current) {
      moonMeshRef.current.position.set(mx, my, z);
      moonMeshRef.current.visible = !isDaytime;
    }

    if (fogRef.current) {
        const targetFog = isDaytime ? new THREE.Color('#6e8594') : new THREE.Color('#0a1220');
        fogRef.current.color.lerp(targetFog, 0.05);
    }

    if (starsRef.current) starsRef.current.visible = !isDaytime;
    if (cloudsRef.current) cloudsRef.current.visible = isDaytime;
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={['#6e8594', 10, 80]} />
      <ambientLight ref={ambientLightRef} intensity={0.6} />
      <hemisphereLight ref={hemiLightRef} args={['#a3ccf0', '#2d3330', 0.8]} />
      
      <directionalLight
        ref={sunLightRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      />
      <directionalLight
        ref={moonLightRef}
        color="#a5c4f2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      
      <DynamicSky />
      
      <mesh ref={sunMeshRef}><sphereGeometry args={[4, 16, 16]} /><meshBasicMaterial color="#ffffff" fog={false} /></mesh>
      <mesh ref={moonMeshRef}><sphereGeometry args={[3.5, 16, 16]} /><meshBasicMaterial color="#a5c4f2" fog={false} /></mesh>
      
      <Clouds ref={cloudsRef} material={THREE.MeshBasicMaterial}>
        <Cloud position={[0, 25, -40]} opacity={0.3} speed={0.4} bounds={[50, 5, 5]} segments={10} color="#ffffff" />
      </Clouds>
      <Stars ref={starsRef} radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

const EquipmentConductor = React.memo(({ power }: { power: number }) => {
  const isActive = power > 0;
  
  // Realistically thick power transfer conduit from the back of the panel down the frame
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.6, -0.65),   // Panel junction box
    new THREE.Vector3(0, 1.6, -0.95),  // Back of mount
    new THREE.Vector3(-0.1, 1.0, -0.95),// Drop down arm
    new THREE.Vector3(-0.1, 0.1, -0.95),// Arrive at base
    new THREE.Vector3(-0.1, 0.1, -1.5), // Loop backwards
    new THREE.Vector3(3.3, 0.1, -1.5),  // Travel right along concrete base
    new THREE.Vector3(3.5, 0.5, -1.2),  // Rise up into Inverter Box
  ]), []);

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 128, 0.05, 12, false), [curve]);
  
  return (
    <group>
      {/* Rubber conduit cable */}
      <mesh geometry={tubeGeo} castShadow receiveShadow>
        <RubberMaterial />
      </mesh>

      {/* Commercial Inverter Box tightly modeled */}
      <group position={[3.6, 0.6, -1.0]} castShadow receiveShadow>
        <Box args={[1.0, 1.2, 0.6]} receiveShadow castShadow>
          <InverterMaterial />
        </Box>
        
        {/* Heat vents (fake geometry via thin dark boxes) */}
        <Box args={[0.02, 0.8, 0.4]} position={[0.51, 0, 0]}><RubberMaterial /></Box>
        <Box args={[0.8, 0.05, 0.4]} position={[0, 0.61, 0]}><RubberMaterial /></Box>
        
        {/* Clear Industrial Labeling */}
        <group position={[0, 0.3, 0.31]}>
          <Text fontSize={0.12} color="#1e293b" anchorX="center" anchorY="bottom" characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!">
            SOLAR INVERTER
          </Text>
          <Text fontSize={0.06} position={[0, -0.08, 0]} color="#475569" anchorX="center" anchorY="top">
            A/C 240V - MAX 10kW
          </Text>
        </group>
        
        {/* Status Screen */}
        <mesh position={[0, 0, 0.305]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshBasicMaterial color={isActive ? "#0ea5e9" : "#1e293b"} />
        </mesh>
      </group>

    </group>
  );
});

// ─── 2D Sun Arc Display ───────────────────────────────────────────────────────

/** Maps simProgress (0‒1) to a percentage along the sky arc (0% = far left, 100% = far right) */
const progressToArcPct = (p: number): number => {
  // Daytime is roughly 0.25 (6 am) → 0.75 (6 pm).
  // We clamp outside those hours to 0 / 100.
  const norm = (p - 0.25) / 0.5; // 0 at dawn, 1 at dusk
  return Math.max(0, Math.min(norm * 100, 100));
};

const SunArcDisplay = React.memo(({ simProgress }: { simProgress: number }) => {
  const pct = progressToArcPct(simProgress);
  const isDaytime = simProgress >= 0.25 && simProgress <= 0.75;

  // Compute the arc Y offset — highest at noon (pct=50)
  const arcY = Math.sin((pct / 100) * Math.PI) * 36; // 0px at edges, 36px at peak

  return (
    <div className="relative w-full h-14 pointer-events-none select-none">
      {/* Track line */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 48"
        preserveAspectRatio="none"
      >
        <path
          d="M 2 44 Q 50 4 98 44"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="2 2"
        />
        {isDaytime && (
          <circle cx={2 + pct * 0.96} cy={44 - arcY} r="2.5" fill="#FBBF24" opacity="0.95">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Glow halo */}
        {isDaytime && (
          <circle cx={2 + pct * 0.96} cy={44 - arcY} r="5" fill="#FDE68A" opacity="0.15" />
        )}
      </svg>

      {/* Dawn / Dusk labels */}
      <span className="absolute left-0 bottom-0 text-[9px] text-slate-500 font-bold uppercase tracking-widest">Dawn</span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-[9px] text-yellow-400/70 font-bold uppercase tracking-widest">Noon</span>
      <span className="absolute right-0 bottom-0 text-[9px] text-slate-500 font-bold uppercase tracking-widest">Dusk</span>
    </div>
  );
});
SunArcDisplay.displayName = 'SunArcDisplay';



// ─── Main export ──────────────────────────────────────────────────────────────

export function SolarDigitalTwin(props: SolarDigitalTwinProps) {
  const [simProgress, setSimProgress] = useState(getSimProgress);

  // Sync React UI tightly with the ThreeJS continuous rendering loop
  // Lowered frequency for UI-only updates to 1s to save CPU
  useEffect(() => {
    const i = setInterval(() => {
      setSimProgress(getSimProgress());
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const safeProps = useMemo(() => ({
    lightIndex: props.lightIndex || 0,
    voltage: props.voltage || 0,
    power: props.power || 0,
    temperature: props.temperature || 0,
    dustIndex: props.dustIndex || 0,
  }), [props.lightIndex, props.voltage, props.power, props.temperature, props.dustIndex]);

  const expectedPower = calculateExpectedPower(simProgress);
  const efficiency = expectedPower > 0 
    ? Math.min((safeProps.power / expectedPower) * 100, 100) 
    : 0;

  // Status computation memoized
  const statusConfig = useMemo(() => {
     let icon = CheckCircle2;
     let text = "System Optimal";
     let color = "text-emerald-400";
     let pulse = "bg-emerald-500";
     
     const isLossy = safeProps.power > 0 && expectedPower > 5 && safeProps.power < (expectedPower * 0.7);

     if (safeProps.temperature > 50) {
        icon = AlertTriangle;
        text = "Overheating Warning";
        color = "text-rose-500";
        pulse = "bg-rose-500";
     } else if (isLossy) {
        icon = AlertTriangle;
        text = "Low Output Detected";
        color = "text-amber-500";
        pulse = "bg-amber-500";
     } else if (safeProps.power === 0 && expectedPower < 1) {
        icon = Info;
        text = "Night / System Idle";
        color = "text-slate-400";
        pulse = "bg-slate-500";
     } else if (safeProps.power === 0 && expectedPower >= 1) {
        icon = AlertTriangle;
        text = "Offline - Zero Output";
        color = "text-rose-500";
        pulse = "bg-rose-500";
     }
     return { icon, text, color, pulse };
  }, [safeProps.power, safeProps.temperature, expectedPower]);

  const StatusIcon = statusConfig.icon;

  return (
    <div className="w-full h-[640px] relative rounded-3xl overflow-hidden bg-[#0a1220] shadow-2xl flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          {/* Status + metrics panel */}
          <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl pointer-events-auto min-w-[300px]">
            <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              Environment Simulation
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.pulse} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.pulse}`}></span>
              </span>
              <span className={`${statusConfig.color} text-xs font-bold tracking-widest uppercase flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" /> {statusConfig.text}
              </span>
            </div>
            <div className="mt-4 flex gap-4 pt-2 border-t border-white/10">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-extrabold tracking-widest">Expected</p>
                <div className="text-xl font-light text-slate-300">{expectedPower.toFixed(1)} <span className="text-sm">W</span></div>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="text-slate-400 text-[10px] uppercase font-extrabold tracking-widest text-[#38bdf8]">Actual Output</p>
                <div className="text-2xl font-bold text-white">{safeProps.power.toFixed(1)} <span className="text-sm font-light text-slate-400">W</span></div>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="text-slate-400 text-[10px] uppercase font-extrabold tracking-widest">Efficiency</p>
                <div className="text-xl font-light text-white">{efficiency.toFixed(1)}<span className="text-sm font-light text-slate-400">%</span></div>
              </div>
            </div>

            {/* ☀️ Sun Arc */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sun Position</p>
              <SunArcDisplay simProgress={simProgress} />
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-end justify-center md:justify-start pointer-events-auto flex-wrap pb-[10px]">
          <MetricCard icon={<Zap className="w-5 h-5 text-cyan-400" />} label="Voltage" value={`${safeProps.voltage.toFixed(1)} V`} trend="up" />
          <MetricCard icon={<Thermometer className="w-5 h-5 text-rose-400" />} label="Temperature" value={`${safeProps.temperature.toFixed(1)} °C`} trend={safeProps.temperature > 50 ? "up" : "down"} />
        </div>
      </div>

      <ThreeScene {...safeProps} expectedPower={expectedPower} />
    </div>
  );
}

// Optimized 3D Scene to run on its own cycle
const ThreeScene = React.memo((props: any) => (
  <Canvas shadows={{ type: 1 }} camera={{ position: [-5, 2.5, 4.5], fov: 42 }}>
    <OrbitControls 
      enableZoom={true} 
      enablePan={false}
      minDistance={3}
      maxDistance={12}
      minPolarAngle={0} 
      maxPolarAngle={Math.PI / 2 - 0.05}
      target={[0, 0.5, 0]}
    />
    
    <EnvironmentSystem />
    <SolarPanelModel {...props} />
    <EquipmentConductor power={props.power} />
    <SimulationClock />

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <GroundMaterial />
    </mesh>

    <EffectComposer>
      <Bloom luminanceThreshold={2.0} mipmapBlur intensity={0.5} />
    </EffectComposer>
  </Canvas>
));

const MetricCard = React.memo(({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: "up" | "down" }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl min-w-[140px] transition-all duration-300 cursor-pointer group"
    style={{ willChange: "transform, opacity" }}
  >
    <div className="flex items-center gap-2 mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
      {icon}
      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
      <span className={trend === "up" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
        {trend === "up" ? "↑" : "↓"}
      </span>
    </div>
  </motion.div>
));

// Isolated Simulation Clock to prevent full-page re-renders
function SimulationClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <group position={[0, 3.5, 0]}>
      <Text
        fontSize={0.25}
        color="#22D3EE"
        anchorX="center"
        anchorY="middle"
        outlineWidth="5%"
        outlineColor="#0f172a"
      >
        {time}
      </Text>
      <Text
        position={[0, -0.2, 0]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        SIMULATION REAL-TIME
      </Text>
    </group>
  );
}
