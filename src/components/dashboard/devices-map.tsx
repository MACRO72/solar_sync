import Image from 'next/image';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function DevicesMap() {
  const mapImage = PlaceHolderImages.find(p => p.id === 'device-map');
  return (
    <GlassCard className="overflow-hidden">
        <CardHeader>
            <CardTitle>Device Geo-Distribution</CardTitle>
            <CardDescription>Geographical location of sensor nodes.</CardDescription>
        </CardHeader>
        <CardContent>
            {mapImage && (
                <Image
                    src={mapImage.imageUrl}
                    alt={mapImage.description}
                    data-ai-hint={mapImage.imageHint}
                    width={1200}
                    height={800}
                    className="w-full h-auto rounded-lg border border-border"
                />
            )}
        </CardContent>
    </GlassCard>
  );
}
