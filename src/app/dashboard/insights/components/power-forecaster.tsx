'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getPowerPrediction } from '@/app/dashboard/insights/actions';

import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/glass-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Wand, Cloudy, Zap, HelpCircle } from "lucide-react"

const initialState = {
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
      Predict Power Output
    </Button>
  );
}

export function PowerForecaster() {
  const [state, formAction] = useActionState(getPowerPrediction, initialState);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <GlassCard>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>AI Power Output Forecaster</CardTitle>
            <CardDescription>
              Enter a location to predict the total power output (kWh) for the next 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat_power">Latitude</Label>
              <Input 
                id="lat_power" 
                name="lat" 
                placeholder="e.g., 34.0522"
                defaultValue="34.0522"
              />
              {state?.errors?.lat && <p className="text-sm text-destructive">{state.errors.lat[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng_power">Longitude</Label>
              <Input 
                id="lng_power" 
                name="lng" 
                placeholder="e.g., -118.2437"
                defaultValue="-118.2437"
              />
               {state?.errors?.lng && <p className="text-sm text-destructive">{state.errors.lng[0]}</p>}
            </div>
            {state?.errors?._form && <p className="col-span-full mt-2 text-sm font-medium text-destructive">{state.errors._form[0]}</p>}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </GlassCard>

      <GlassCard className="flex flex-col">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Zap className="h-10 w-10 text-primary" />
          <div>
            <CardTitle>Power Forecast Result</CardTitle>
            <CardDescription>The AI's prediction for the next 24 hours.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          {state.data ? (
            <div className="w-full space-y-4 text-sm">
                <div className="space-y-2 text-center">
                     <h4 className="font-semibold text-foreground flex items-center justify-center gap-2"><Zap className="h-5 w-5 text-yellow-400" />Predicted Power Output</h4>
                     <p className="font-bold text-4xl text-foreground">{state.data.predictedPowerKWh.toFixed(2)} <span className="text-2xl text-muted-foreground">kWh</span></p>
                </div>
                 <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2"><Cloudy className="h-4 w-4 text-blue-300" />Weather Summary</h4>
                    <p className="text-muted-foreground">{state.data.weatherSummary}</p>
                </div>
                 <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2"><HelpCircle className="h-4 w-4 text-green-400" />Actionable Advice</h4>
                    <p className="text-muted-foreground">{state.data.advice}</p>
                </div>
                 <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Confidence</h4>
                    <p className="text-muted-foreground">The AI is {Math.round(state.data.confidence * 100)}% confident in this prediction.</p>
                </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Your power output forecast will appear here.</p>
            </div>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
}
