'use client';
import { useState, useEffect } from 'react';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card";
import { getWeatherForecast, type GetWeatherForecastOutput } from '@/ai/flows/get-weather-forecast';
import { getDeviceLocation } from '@/ai/flows/get-device-location';
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { Skeleton } from '../ui/skeleton';
import { Sun, Cloud, CloudRain, CloudSun, Snowflake, Zap, Wind } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const getWeatherIcon = (iconCode: string) => {
    const main = iconCode.substring(0, 2);
    switch (main) {
        case '01': return <Sun className="h-8 w-8 text-yellow-400" />;
        case '02': return <CloudSun className="h-8 w-8 text-yellow-400" />;
        case '03':
        case '04': return <Cloud className="h-8 w-8 text-gray-400" />;
        case '09':
        case '10': return <CloudRain className="h-8 w-8 text-blue-400" />;
        case '11': return <Zap className="h-8 w-8 text-yellow-500" />;
        case '13': return <Snowflake className="h-8 w-8 text-blue-200" />;
        case '50': return <Wind className="h-8 w-8 text-gray-500" />;
        default: return <Sun className="h-8 w-8 text-yellow-400" />;
    }
}

export function WeatherForecast() {
    const [forecast, setForecast] = useState<GetWeatherForecastOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const { data: devices, loading: devicesLoading } = useRealtimeData();

    useEffect(() => {
        const fetchForecast = async () => {
            if (devices.length > 0) {
                try {
                    // Use the first device's ID to get a location.
                    // In a real app with multiple locations, you'd have a selector.
                    const location = await getDeviceLocation({ deviceId: devices[0].id });
                    if (location) {
                        const weatherData = await getWeatherForecast({ lat: location.lat, lng: location.lng });
                        setForecast(weatherData);
                    }
                } catch (error) {
                    console.error("Failed to fetch weather forecast:", error);
                } finally {
                    setLoading(false);
                }
            } else if (!devicesLoading) {
                // If there are no devices and we are not loading them, stop loading.
                setLoading(false);
            }
        };

        fetchForecast();
    }, [devices, devicesLoading]);

    if (loading) {
        return (
            <GlassCard>
                <CardHeader>
                    <CardTitle>Weather Forecast</CardTitle>
                    <CardDescription>Loading forecast...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center px-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                         <div key={i} className="flex flex-col items-center gap-2">
                             <Skeleton className="h-6 w-10" />
                             <Skeleton className="h-8 w-8 rounded-full" />
                             <Skeleton className="h-4 w-12" />
                         </div>
                    ))}
                </CardContent>
            </GlassCard>
        );
    }
    
    if (!forecast) {
        return (
             <GlassCard>
                <CardHeader>
                    <CardTitle>Weather Forecast</CardTitle>
                    <CardDescription>Could not load forecast data.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-24">
                    <p className="text-muted-foreground">Waiting for device location...</p>
                </CardContent>
            </GlassCard>
        )
    }

    return (
        <GlassCard className="h-full animate-energy-wave">
            <CardHeader>
                <CardTitle>Weather Forecast</CardTitle>
                <CardDescription>5-day forecast for {forecast.city}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center px-2 sm:px-6 overflow-x-auto">
                 {forecast.forecast.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 text-center p-2 min-w-[60px]">
                        <p className="text-sm font-medium text-muted-foreground">
                            {format(parseISO(day.date), 'EEE')}
                        </p>
                        {getWeatherIcon(day.icon)}
                        <p className="text-sm font-semibold whitespace-nowrap">{Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°</p>
                    </div>
                ))}
            </CardContent>
        </GlassCard>
    );
}
