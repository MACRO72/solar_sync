'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getEfficiencyPrediction } from '@/app/dashboard/insights/actions';

import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/glass-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Wand, Cloudy, Star, HelpCircle } from "lucide-react"
import { Progress } from '@/components/ui/progress';

const initialState = {
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
      Predict Efficiency
    </Button>
  );
}

export function EfficiencyForecaster() {
  const [state, formAction] = useActionState(getEfficiencyPrediction, initialState);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <GlassCard>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>AI Efficiency Forecaster</CardTitle>
            <CardDescription>
              Enter a location to predict solar panel efficiency based on the weather forecast.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input 
                id="lat" 
                name="lat" 
                placeholder="e.g., 34.0522"
                defaultValue="34.0522"
              />
              {state?.errors?.lat && <p className="text-sm text-destructive">{state.errors.lat[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input 
                id="lng" 
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
          <Wand className="h-10 w-10 text-primary" />
          <div>
            <CardTitle>Forecast Result</CardTitle>
            <CardDescription>The AI's prediction for the next 24 hours.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          {state.data ? (
            <div className="w-full space-y-4 text-sm">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                         <h4 className="font-semibold text-foreground flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" />Predicted Efficiency</h4>
                         <span className="font-bold text-lg text-foreground">{Math.round(state.data.predictedEfficiency)}%</span>
                    </div>
                    <Progress value={state.data.predictedEfficiency} />
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
              <p>Your efficiency forecast will appear here.</p>
            </div>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
}
