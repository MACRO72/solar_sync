'use client';

import * as React from 'react';
import { useActionState, useEffect } from 'react';
import { getPrediction } from '@/app/dashboard/insights/actions';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/glass-card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Gauge, Sun, Thermometer, Droplets, Wind, Zap } from "lucide-react";
import { useFormStatus } from 'react-dom';
import { useDebounce } from 'use-debounce';

const initialState = {
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Zap className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
      Predict Efficiency
    </Button>
  );
}

export function EfficiencyPredictor() {
  const [state, formAction] = useActionState(getPrediction, initialState);
  
  const [irradiance, setIrradiance] = React.useState(800);
  const [temperature, setTemperature] = React.useState(25);
  const [humidity, setHumidity] = React.useState(50);
  const [dust, setDust] = React.useState(20);

  const formRef = React.useRef<HTMLFormElement>(null);
  
  // Debounce the input values to avoid excessive form submissions
  const [debouncedIrradiance] = useDebounce(irradiance, 300);
  const [debouncedTemperature] = useDebounce(temperature, 300);
  const [debouncedHumidity] = useDebounce(humidity, 300);
  const [debouncedDust] = useDebounce(dust, 300);

  useEffect(() => {
    // Automatically submit the form when debounced values change
    if (formRef.current) {
        const formData = new FormData(formRef.current);
        formAction(formData);
    }
  }, [debouncedIrradiance, debouncedTemperature, debouncedHumidity, debouncedDust, formAction]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <GlassCard>
        <form ref={formRef} action={formAction}>
          <CardHeader>
            <CardTitle>Live Efficiency Predictor</CardTitle>
            <CardDescription>Adjust the sliders to see the AI-predicted panel efficiency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <input type="hidden" name="solar_irradiance" value={irradiance} />
            <input type="hidden" name="temperature" value={temperature} />
            <input type="hidden" name="humidity" value={humidity} />
            <input type="hidden" name="dust_density" value={dust} />
            
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label htmlFor="irradiance-slider" className="flex items-center"><Sun className="mr-2 h-4 w-4 text-yellow-400"/>Solar Irradiance</Label>
                    <span className="font-mono text-sm text-foreground">{irradiance} W/m²</span>
                </div>
                <Slider id="irradiance-slider" value={[irradiance]} onValueChange={(v) => setIrradiance(v[0])} min={0} max={1200} step={10} />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label htmlFor="temp-slider" className="flex items-center"><Thermometer className="mr-2 h-4 w-4 text-destructive"/>Temperature</Label>
                     <span className="font-mono text-sm text-foreground">{temperature}°C</span>
                </div>
                <Slider id="temp-slider" value={[temperature]} onValueChange={(v) => setTemperature(v[0])} min={-10} max={50} step={1} />
            </div>

             <div className="space-y-2">
                <div className="flex justify-between">
                    <Label htmlFor="humidity-slider" className="flex items-center"><Droplets className="mr-2 h-4 w-4 text-blue-400"/>Humidity</Label>
                     <span className="font-mono text-sm text-foreground">{humidity}%</span>
                </div>
                <Slider id="humidity-slider" value={[humidity]} onValueChange={(v) => setHumidity(v[0])} min={0} max={100} step={1} />
            </div>

             <div className="space-y-2">
                <div className="flex justify-between">
                    <Label htmlFor="dust-slider" className="flex items-center"><Wind className="mr-2 h-4 w-4 text-slate-400"/>Dust Density</Label>
                     <span className="font-mono text-sm text-foreground">{dust} μg/m³</span>
                </div>
                <Slider id="dust-slider" value={[dust]} onValueChange={(v) => setDust(v[0])} min={0} max={200} step={1} />
            </div>

          </CardContent>
          {/* We can hide the manual submit button as it is now automatic */}
          {/* <CardFooter>
            <SubmitButton />
          </CardFooter> */}
        </form>
      </GlassCard>

      <GlassCard className="flex flex-col items-center justify-center">
        <CardHeader className="text-center">
            <CardTitle>Predicted Efficiency</CardTitle>
            <CardDescription>Based on the current inputs.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
            <Gauge className="h-24 w-24 text-primary" />
            <p className="text-6xl font-bold text-foreground">
                {state.data ? `${state.data.predicted_efficiency.toFixed(1)}%` : '-'}
            </p>
            {state?.errors && <p className="mt-2 text-sm font-medium text-destructive">{(state.errors as any)._form?.[0]}</p>}
        </CardContent>
      </GlassCard>
    </div>
  );
}
