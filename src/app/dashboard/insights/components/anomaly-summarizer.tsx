'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getAnomalySummary } from '@/app/dashboard/insights/actions';

import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/glass-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Zap, BrainCircuit } from "lucide-react"

const initialState = {
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
      Summarize Anomaly
    </Button>
  );
}

export function AnomalySummarizer() {
  const [state, formAction] = useActionState(getAnomalySummary, initialState);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
        <GlassCard>
            <form action={formAction}>
            <CardHeader>
                <CardTitle>AI Anomaly Summarizer</CardTitle>
                <CardDescription>
                    Describe a performance anomaly, and the AI will provide a concise summary.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="anomalyData">Anomaly Data</Label>
                <Textarea 
                    id="anomalyData" 
                    name="anomalyData" 
                    placeholder="e.g., 'Inverter #4 showing intermittent voltage drops between 2 PM and 4 PM for the past three days, correlating with peak temperature hours. Output efficiency dropped by 15% during these events.'" 
                    rows={6} 
                />
                {state?.errors?.anomalyData && <p className="text-sm text-destructive">{state.errors.anomalyData[0]}</p>}
                </div>
                {state?.errors?._form && <p className="mt-2 text-sm font-medium text-destructive">{state.errors._form[0]}</p>}
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
            </form>
        </GlassCard>

        <GlassCard className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                <BrainCircuit className="h-10 w-10 text-primary" />
                <div>
                    <CardTitle>AI Summary</CardTitle>
                    <CardDescription>The AI's explanation of the anomaly.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
            {state.data ? (
                <p className="text-sm text-muted-foreground">{state.data.summary}</p>
            ) : (
                <div className="text-center text-muted-foreground">
                    <p>Your summary will appear here.</p>
                </div>
            )}
            </CardContent>
        </GlassCard>
    </div>
  );
}
