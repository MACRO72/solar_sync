"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Loader2 } from "lucide-react";

interface SolarDigitalTwinProps {
  lightIndex: number;
  voltage: number;
  power: number;
  temperature: number;
  dustIndex: number;
}

const SceneDynamic = dynamic(
  () => import("./solar-digital-twin-scene").then(mod => mod.SolarDigitalTwin),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[640px] flex items-center justify-center bg-[#0a1220] rounded-3xl">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }
);

export function SolarDigitalTwin(props: SolarDigitalTwinProps) {
  return <SceneDynamic {...props} />;
}
