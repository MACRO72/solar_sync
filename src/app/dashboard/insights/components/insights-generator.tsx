'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { getMaintenanceSuggestion } from '@/app/dashboard/insights/actions';

import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/glass-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Lightbulb, ShieldAlert, Wrench, CheckCircle } from "lucide-react"
import { Progress } from '@/components/ui/progress';

const initialState = {
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
      Generate Insights
    </Button>
  );
}

export function InsightsGenerator() {
  const [state, formAction] = useFormState(getMaintenanceSuggestion, initialState);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <GlassCard>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Predictive Maintenance AI</CardTitle>
            <CardDescription>Provide system data to get AI-powered maintenance suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemDescription">System Description</Label>
              <Textarea id="systemDescription" name="systemDescription" placeholder="e.g., 10kW system with 25x 400W panels, 1x SolarEdge inverter..." rows={3} />
              {state?.errors?.systemDescription && <p className="text-sm text-destructive">{state.errors.systemDescription[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="historicalData">Historical Data</Label>
              <Textarea id="historicalData" name="historicalData" placeholder="Paste historical performance data, e.g., daily output for the last 30 days..." rows={5} />
               {state?.errors?.historicalData && <p className="text-sm text-destructive">{state.errors.historicalData[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sensorReadings">Recent Sensor Readings</Label>
              <Textarea id="sensorReadings" name="sensorReadings" placeholder="Paste recent sensor readings, e.g., voltage, current, temp from the last hour..." rows={5} />
              {state?.errors?.sensorReadings && <p className="text-sm text-destructive">{state.errors.sensorReadings[0]}</p>}
            </div>
            {state?.errors?._form && <p className="mt-2 text-sm font-medium text-destructive">{state.errors._form[0]}</p>}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </GlassCard>

      <div className="space-y-8">
        {state.data ? (
          <>
            <GlassCard>
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                  <CheckCircle className="h-10 w-10 text-status-positive" />
                   <div>
                    <CardTitle>Confidence Score</CardTitle>
                    <CardDescription>AI confidence in this prediction.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center gap-4 pt-2">
                    <p className="text-3xl font-bold">{Math.round(state.data.confidenceScore * 100)}%</p>
                    <Progress value={state.data.confidenceScore * 100} className="w-full" />
                </CardContent>
            </GlassCard>
            <GlassCard>
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                  <ShieldAlert className="h-10 w-10 text-destructive" />
                  <div>
                    <CardTitle>Predicted Failures</CardTitle>
                    <CardDescription>Potential issues detected by the AI.</CardDescription>
                  </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{state.data.predictedFailures}</p>
              </CardContent>
            </GlassCard>
            <GlassCard>
               <CardHeader className="flex-row items-center gap-4 space-y-0">
                  <Wrench className="h-10 w-10 text-primary" />
                  <div>
                    <CardTitle>Maintenance Schedule</CardTitle>
                    <CardDescription>Recommended actions to take.</CardDescription>
                  </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-sm">
                <p className="text-muted-foreground">{state.data.maintenanceSchedule}</p>
                 <div>
                    <p className="font-semibold text-foreground">Actionable Advice:</p>
                    <p className="text-muted-foreground">{state.data.actionableAdvice}</p>
                </div>
              </CardContent>
            </GlassCard>
          </>
        ) : (
          <GlassCard className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
            <CardContent className="space-y-2">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                <Lightbulb className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Awaiting Data</h3>
              <p className="text-muted-foreground">Your AI insights will appear here once generated.</p>
            </CardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
