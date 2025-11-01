'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getCsvAnalysis } from '@/app/dashboard/insights/actions';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/glass-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, BarChart, BrainCircuit } from "lucide-react";
import * as React from 'react';

const initialState = {
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
      Analyze CSV
    </Button>
  );
}

export function CsvAnalyzer() {
  const [state, formAction] = useActionState(getCsvAnalysis, initialState);
  const [fileName, setFileName] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : '');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
        <GlassCard>
            <form action={formAction}>
            <CardHeader>
                <CardTitle>CSV Data Analyzer</CardTitle>
                <CardDescription>
                    Upload a CSV file with sensor data and let AI provide an analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="csvFile">CSV File</Label>
                    <div className="relative">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full justify-start text-muted-foreground">
                            <Upload className="mr-2 h-4 w-4" />
                            {fileName || 'Click to select a file...'}
                        </Button>
                        <Input 
                            id="csvFile" 
                            name="csvFile" 
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
                {state?.errors?._form && <p className="mt-2 text-sm font-medium text-destructive">{state.errors._form[0]}</p>}
                 {state?.errors?.csvData && <p className="mt-2 text-sm font-medium text-destructive">{state.errors.csvData[0]}</p>}
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
            </form>
        </GlassCard>

        <GlassCard className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                <BarChart className="h-10 w-10 text-primary" />
                <div>
                    <CardTitle>Analysis Report</CardTitle>
                    <CardDescription>The AI's findings from your CSV data.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-4">
            {state.data ? (
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-foreground">Analysis Summary</h4>
                        <p className="text-muted-foreground">{state.data.analysis}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground">File Details</h4>
                        <p className="text-muted-foreground">Rows Analyzed: {state.data.rowCount}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-muted-foreground">Headers:</span>
                            {state.data.headers.map(h => <Badge key={h} variant="secondary">{h}</Badge>)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground">Key Metrics</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-muted-foreground">
                        {Object.entries(state.data.keyMetrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b border-border/20 pb-1">
                                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="font-mono text-foreground">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                    <div className="space-y-2">
                        <FileText className="mx-auto h-12 w-12" />
                        <p>Your analysis report will appear here.</p>
                    </div>
                </div>
            )}
            </CardContent>
        </GlassCard>
    </div>
  );
}
