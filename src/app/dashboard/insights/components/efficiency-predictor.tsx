'use client';
import * as React from 'react';
import { useDebounce } from 'use-debounce';
import { getLivePrediction } from '@/app/dashboard/insights/actions';

import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Gauge } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const initialPredictionState = {
  temperature: 30,
  humidity: 50,
  solar_irradiance: 800,
  dust_density: 100,
};

export function EfficiencyPredictor() {
  const [input, setInput] = React.useState(initialPredictionState);
  const [debouncedInput] = useDebounce(input, 300);
  const [prediction, setPrediction] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSliderChange = (name: keyof typeof input, value: number) => {
    setInput(prev => ({ ...prev, [name]: value }));
  };

  React.useEffect(() => {
    async function fetchPrediction() {
      setIsLoading(true);
      setError(null);
      const result = await getLivePrediction(debouncedInput);
      if (result.errors?._form) {
        setError(result.errors._form[0]);
        setPrediction(null);
      } else if (result.data) {
        setPrediction(result.data.predicted_efficiency);
      }
      setIsLoading(false);
    }
    fetchPrediction();
  }, [debouncedInput]);
  
  const gaugeRotation = prediction !== null ? (prediction / 100) * 180 - 90 : -90;

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle>Live Efficiency Predictor</CardTitle>
        <CardDescription>
          Adjust the sliders to see a real-time efficiency prediction from your deployed AI model.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature</Label>
              <span className="font-mono text-sm">{input.temperature}°C</span>
            </div>
            <Slider id="temperature" min={0} max={60} step={1} value={[input.temperature]} onValueChange={([v]) => handleSliderChange('temperature', v)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="humidity">Humidity</Label>
              <span className="font-mono text-sm">{input.humidity}%</span>
            </div>
            <Slider id="humidity" min={0} max={100} step={1} value={[input.humidity]} onValueChange={([v]) => handleSliderChange('humidity', v)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="solar_irradiance">Solar Irradiance</Label>
              <span className="font-mono text-sm">{input.solar_irradiance} W/m²</span>
            </div>
            <Slider id="solar_irradiance" min={0} max={1200} step={10} value={[input.solar_irradiance]} onValueChange={([v]) => handleSliderChange('solar_irradiance', v)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="dust_density">Dust Density</Label>
              <span className="font-mono text-sm">{input.dust_density} µg/m³</span>
            </div>
            <Slider id="dust_density" min={0} max={500} step={5} value={[input.dust_density]} onValueChange={([v]) => handleSliderChange('dust_density', v)} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-48 h-24 overflow-hidden">
                <div className="absolute w-full h-full border-[20px] border-muted rounded-t-full border-b-0"></div>
                <div className="absolute w-full h-full border-[20px] border-primary rounded-t-full border-b-0 transition-transform duration-300" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-foreground rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 h-20 w-1 origin-bottom transition-transform duration-500 ease-in-out" style={{ transform: `rotate(${gaugeRotation}deg)` }}>
                    <div className="w-full h-full bg-foreground"></div>
                </div>
            </div>
            {isLoading ? (
                 <Skeleton className="h-10 w-28" />
            ) : error ? (
                <div className="text-center">
                    <p className="text-lg font-bold text-destructive">Error</p>
                    <p className="text-xs text-destructive">{error}</p>
                </div>
            ) : prediction !== null ? (
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Predicted Efficiency</p>
                    <p className="text-4xl font-bold text-primary">{prediction.toFixed(1)}%</p>
                </div>
            ) : (
                 <p className="text-muted-foreground">Adjust sliders to predict</p>
            )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
