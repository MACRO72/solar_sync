"use client";

import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
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
  Clouds,
  MeshReflectorMaterial
} from '@react-three/drei';

import * as THREE from 'three';
import { Zap, Sun, Thermometer, Info, AlertTriangle, CheckCircle2, Moon } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
// Post-processing imports removed for stabilization

interface SolarDigitalTwinProps {
  lightIndex: number;
  voltage: number;
  power: number;
  temperature: number;
  dustIndex: number;
}

const DEFAULT_TILT_DEG = 30; // degrees
const TILT_ANGLE = (DEFAULT_TILT_DEG * Math.PI) / 180;
const PANEL_WIDTH = 3.6;
const PANEL_HEIGHT = 2.0;

// Centralized simulation driver mapped exactly to the real-world 24-hour clock
const getSimProgress = () => {
  const now = new Date();
  const secondsSinceMidnight =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds() +
    now.getMilliseconds() / 1000;
  return secondsSinceMidnight / 86400; // 0 (midnight) → 1 (midnight)
};

// Standard Materials mimicking real outdoor weathering as functional components to prevent React Element reuse crashes
const AluminumMaterial = () => <meshStandardMaterial color="#b0b5b9" metalness={0.8} roughness={0.3} />;
const ConcreteMaterial = () => <meshStandardMaterial color="#888c8d" roughness={0.9} metalness={0.1} />;
const RubberMaterial = () => <meshStandardMaterial color="#1a1a1a" roughness={0.9} />;
const InverterMaterial = () => <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.6} />;
const GroundMaterial = () => <meshStandardMaterial color="#1f2937" roughness={0.95} metalness={0.05} />;

const calculateExpectedPower = (progress: number) => {
  // progress 0 = midnight, 0.5 = noon, 1.0 = midnight
  const angle = (progress - 0.25) * 2 * Math.PI;
  // Panel is tilted back slightly. 
  // A purely mathematical dot-product simplification:
  const incidence = Math.sin(angle); // 0 at dawn (6am), 1 at noon, 0 at dusk (6pm)
  return incidence > 0 ? incidence * 20.0 : 0; // 20W max
};

const WireCables = React.memo(() => {
  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 1.55, -0.75), // accurately at bottom of junction box
      new THREE.Vector3(1.5, 0.05, -0.6),  // sagging realistically down towards ground
      new THREE.Vector3(3.1, 0.2, -1.0)    // directly entering inverter side
    );
  }, []);

  return (
    <mesh castShadow receiveShadow>
      <tubeGeometry args={[curve, 32, 0.03, 8, false]} />
      <RubberMaterial />
    </mesh>
  );
});

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
        <Box args={[3.4, 0.05, 0.1]} position={[0, 0.15, -0.9]} castShadow><AluminumMaterial /></Box>
        <Box args={[3.4, 0.05, 0.1]} position={[0, 0.15, 0.9]} castShadow><AluminumMaterial /></Box>

        {/* Support Struts */}
        <Cylinder args={[0.04, 0.04, 0.6]} position={[-1.6, 0.45, 0.9]} castShadow><AluminumMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 0.6]} position={[1.6, 0.45, 0.9]} castShadow><AluminumMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 1.67]} position={[-1.6, 0.985, -0.9]} castShadow><AluminumMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 1.67]} position={[1.6, 0.985, -0.9]} castShadow><AluminumMaterial /></Cylinder>
      </group>

      {/* TILTED PANEL ASSEMBLY */}
      <group position={[0, 1.3, 0]} rotation={[activeTilt, 0, 0]} ref={panelRef}>
        
        {/* Outer Heavy Aluminum Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[PANEL_WIDTH + 0.15, 0.1, PANEL_HEIGHT + 0.15]} />
          <AluminumMaterial />
        </mesh>

        {/* Backsheet */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[PANEL_WIDTH, 0.02, PANEL_HEIGHT]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>

        {/* PV Base Frame */}
        <mesh position={[0, 0.045, 0]} receiveShadow>
          <boxGeometry args={[PANEL_WIDTH, 0.015, PANEL_HEIGHT]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* PV Glass Array - GPU-light reflective material */}
        <mesh position={[0, 0.053, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
          <meshStandardMaterial
            color="#081426"
            roughness={0.05}
            metalness={0.9}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Silver grid/busbar traces */}
        <group position={[0, 0.054, 0]}>
          <gridHelper 
            args={[1, 10, '#607d8b', '#607d8b']} 
            scale={[PANEL_WIDTH, 1, PANEL_HEIGHT]} 
          />
        </group>

        {/* Mounting Screws/Bolts */}
        <Cylinder args={[0.04, 0.04, 0.02]} position={[-PANEL_WIDTH/2 + 0.3, 0.065, -PANEL_HEIGHT/2 + 0.3]}><RubberMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 0.02]} position={[PANEL_WIDTH/2 - 0.3, 0.065, -PANEL_HEIGHT/2 + 0.3]}><RubberMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 0.02]} position={[-PANEL_WIDTH/2 + 0.3, 0.065, PANEL_HEIGHT/2 - 0.3]}><RubberMaterial /></Cylinder>
        <Cylinder args={[0.04, 0.04, 0.02]} position={[PANEL_WIDTH/2 - 0.3, 0.065, PANEL_HEIGHT/2 - 0.3]}><RubberMaterial /></Cylinder>

        {/* Junction Box */}
        <mesh position={[0, -0.1, -0.8]}>
          <boxGeometry args={[0.3, 0.15, 0.3]} />
          <RubberMaterial />
        </mesh>

        {tempScale > 0.1 && (
          <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0} />
          </mesh>
        )}
      </group>
    </group>
  );
});

const RealisticMoon = React.memo(({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[12.0, 32, 32]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
});



// Consolidated lighting and atmospheric elements tied to exact simulation clock
const CelestialBodies = React.memo(({ simProgress }: { simProgress: number }) => {
  // Continuous 24-hour orbital angle
  // 6 AM (0.25) = 0 rad, Noon (0.5) = PI/2, 6 PM (0.75) = PI, Midnight (0/1) = 3PI/2
  const angle = (simProgress - 0.25) * 2 * Math.PI;

  const orbitalRadius = 120;
  const zPlaneSky = -150; // Deep in the background sky

  const sunElevation = Math.sin(angle); // 1 = noon, 0 = horizon, -1 = midnight
  const isNight = sunElevation < 0;

  const sunPos: [number, number, number] = [
    Math.cos(angle) * orbitalRadius * 2,
    sunElevation * orbitalRadius * 1.5,
    zPlaneSky,
  ];

  const moonPos: [number, number, number] = [
    -Math.cos(angle) * orbitalRadius * 2,
    -sunElevation * orbitalRadius * 1.5,
    zPlaneSky,
  ];

  return (
    <>
      {/* Dynamic ambient based on sun elevation */}
      <ambientLight intensity={Math.max(0.15, sunElevation * 0.6)} />
      <hemisphereLight args={['#b9d5ff', '#333311', Math.max(0.1, sunElevation * 0.5)]} />

      {/* Real physical sky - GPU-safe now that shadows/reflector are off */}
      <Sky
        distance={450000}
        sunPosition={sunPos}
        turbidity={2}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Image-based lighting — gives metallic panel real-world reflections */}
      <Environment
        preset={
          isNight ? 'night' 
          : sunElevation < 0.15 ? 'sunset'
          : 'park'
        }
        background={false}
      />

      {/* Atmospheric depth fog */}
      <fog attach="fog" args={[
        isNight ? '#010510' : sunElevation > 0.3 ? '#87ceeb' : '#e8722a',
        18,   // near
        80    // far
      ]} />

      {/* Stars at night */}
      <group visible={sunElevation < 0.15}>
        <Stars radius={120} depth={60} count={2000} factor={4} fade speed={0.5} />
      </group>

      {/* Directional sun light — no shadow maps */}
      <directionalLight
        position={sunPos}
        intensity={Math.max(0, sunElevation * 4.0)}
        color={sunElevation < 0.15 ? '#ffb347' : '#ffffff'}
      />

      {/* Moon Mesh & moonlight */}
      <group visible={isNight}>
        <Suspense fallback={
          <mesh position={moonPos}>
            <sphereGeometry args={[12.0, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        }>
          <RealisticMoon position={moonPos} />
        </Suspense>
        <ambientLight intensity={Math.max(0, -sunElevation * 0.2)} color="#c8d8ff" />
      </group>
    </>
  );
});

const EquipmentConductor = React.memo(({ power }: { power: number }) => {
  const isActive = power > 0;
  
  return (
    <group>
      {/* Simplified Commercial Inverter Box tightly modeled (No complex tubeGeometry) */}
      <group position={[3.6, 0.6, -1.0]}>
        <Box args={[1.0, 1.2, 0.6]} castShadow receiveShadow>
          <InverterMaterial />
        </Box>
        
        {/* Heat vents (fake geometry via thin dark boxes) */}
        <Box args={[0.02, 0.8, 0.4]} position={[0.51, 0, 0]} castShadow><RubberMaterial /></Box>
        <Box args={[0.8, 0.05, 0.4]} position={[0, 0.61, 0]} castShadow><RubberMaterial /></Box>
        
        {/* Status Screen */}
        <mesh position={[0, 0, 0.305]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshBasicMaterial color={isActive ? "#0ea5e9" : "#1e293b"} />
        </mesh>
        
        {/* Labels */}
        <Text
          position={[0, 0.45, 0.31]}
          fontSize={0.12}
          color="#334155"
          font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
        >
          SOLAR INVERTER
        </Text>
        <Text
          position={[0, 0.28, 0.31]}
          fontSize={0.05}
          color="#64748b"
          font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
        >
          A/C 240V   MAX 10kW
        </Text>
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
  const [simProgress, setSimProgress] = useState(0); // Initialized to 0 to avoid hydration mismatch

  // Sync React UI tightly with the ThreeJS continuous rendering loop
  // Lowered frequency for UI-only updates to 1s to save CPU
  useEffect(() => {
    setSimProgress(getSimProgress()); // Set initial progress on mount
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
    <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl h-[500px] sm:h-[640px]" style={{ backgroundColor: '#0a1220' }}>
      {/* 3D Canvas sits absolutely, covers the entire frame */}
      <ThreeScene {...safeProps} expectedPower={expectedPower} simProgress={simProgress} />

      {/* HUD Overlay — pointer-events-none except explicit UI children */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-6" style={{ zIndex: 10 }}>
        <div className="flex justify-between items-start gap-4 flex-wrap">
          {/* Status + metrics panel */}
          <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-2 sm:p-4 shadow-xl pointer-events-auto w-full max-w-[210px] sm:max-w-[320px] sm:min-w-[300px]">
            <h3 className="text-white font-bold text-[13px] sm:text-lg tracking-tight flex items-center gap-1.5 sm:gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              Environment Simulation
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.pulse} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 ${statusConfig.pulse}`}></span>
              </span>
              <span className={`${statusConfig.color} text-[9px] sm:text-xs font-bold tracking-widest uppercase flex items-center gap-1`}>
                <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {statusConfig.text}
              </span>
            </div>
            <div className="mt-2.5 sm:mt-4 flex gap-3 sm:gap-4 pt-2 border-t border-white/10">
              <div>
                <p className="text-slate-500 text-[8px] sm:text-[10px] uppercase font-extrabold tracking-widest">
                  <span className="sm:hidden">Exp.</span>
                  <span className="hidden sm:inline">Expected</span>
                </p>
                <div className="text-sm sm:text-xl font-light text-slate-300">{expectedPower.toFixed(1)} <span className="text-[10px] sm:text-sm">W</span></div>
              </div>
              <div className="border-l border-white/10 pl-2.5 sm:pl-4">
                <p className="text-slate-400 text-[8px] sm:text-[10px] uppercase font-extrabold tracking-widest text-[#38bdf8]">
                  <span className="sm:hidden">Actual</span>
                  <span className="hidden sm:inline">Actual Output</span>
                </p>
                <div className="text-base sm:text-2xl font-bold text-white">{safeProps.power.toFixed(1)} <span className="text-[10px] sm:text-sm font-light text-slate-400">W</span></div>
              </div>
              <div className="border-l border-white/10 pl-2.5 sm:pl-4">
                <p className="text-slate-400 text-[8px] sm:text-[10px] uppercase font-extrabold tracking-widest">
                  <span className="sm:hidden">Eff.</span>
                  <span className="hidden sm:inline">Efficiency</span>
                </p>
                <div className="text-sm sm:text-xl font-light text-white">{efficiency.toFixed(0)}<span className="text-[10px] sm:text-sm font-light text-slate-400">%</span></div>
              </div>
            </div>

            {/* ☀️ Sun Arc - Hidden on mobile to reclaim space */}
            <div className="hidden sm:block mt-4 pt-3 border-t border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sun Position</p>
              <SunArcDisplay simProgress={simProgress} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4 items-end justify-center md:justify-start pointer-events-auto flex-wrap pb-[5px] sm:pb-[10px]">
          <MetricCard icon={<Zap className="w-5 h-5 text-cyan-400" />} label="Voltage" value={`${safeProps.voltage.toFixed(1)} V`} trend="up" />
          <MetricCard icon={<Thermometer className="w-5 h-5 text-rose-400" />} label="Temperature" value={`${safeProps.temperature.toFixed(1)} °C`} trend={safeProps.temperature > 50 ? "up" : "down"} />
        </div>
      </div>
    </div>
  );
}

// CRITICAL: wrapper div must have flex:1 + minHeight:0 so the Canvas
// fills the available height in its flex-col parent.
const ThreeScene = React.memo((props: any) => {
  const [canvasKey, setCanvasKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Use standard mobile breakpoint or aspect ratio check
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Standard PC: [-4.5, 2.5, 5.5], fov: 40
  // Mobile: Adjusted to move panel into the visible gap
  const cameraConfig = useMemo(() => {
    if (isMobile) {
      return { position: [-5.5, 3.8, 9.5] as [number, number, number], fov: 42 };
    }
    return { position: [-4.5, 2.5, 5.5] as [number, number, number], fov: 40 };
  }, [isMobile]);

  return (
    <div 
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        touchAction: 'none',
        overscrollBehavior: 'none',
        cursor: 'grab',
      }}
    >
      <Canvas
        key={canvasKey}
        shadows={false}
        style={{ width: '100%', height: '100%', display: 'block' }}
        camera={cameraConfig}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a1220', 1);
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setTimeout(() => setCanvasKey(k => k + 1), 500);
          });
        }}
      >
        {/* Remove solid background to expose atmospheric sky gradients */}
        <CelestialBodies simProgress={props.simProgress ?? 0} />

      <OrbitControls
        makeDefault
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        target={[0, 1.0, 0]}
      />

      <SolarPanelModel {...props} expectedPower={props.expectedPower} />
      <EquipmentConductor power={props.power} />
      <WireCables />
      <SimulationClock />

      {/* Realistic rooftop ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
    </Canvas>
  </div>
  );
});

const MetricCard = React.memo(({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: "up" | "down" }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-2 sm:p-4 shadow-xl min-w-[110px] sm:min-w-[140px] transition-all duration-300 cursor-pointer group"
    style={{ willChange: "transform, opacity" }}
  >
    <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
      {icon}
      <span className="text-[8px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</span>
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
