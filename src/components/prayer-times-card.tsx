import type { ComponentType } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrayerTimes, PrayerName } from "@/lib/prayer-times";
import { Countdown } from "./countdown";
import { Separator } from "@/components/ui/separator";
import { Sunrise, Sun, SunDim, Sunset, Moon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PrayerTimesCardProps {
  prayerTimes: PrayerTimes;
  nextPrayer: { name: PrayerName, time: Date };
  currentPrayerName?: PrayerName;
  date: Date;
  locationDenied?: boolean;
}

const prayerIcons: Record<PrayerName, ComponentType<{className?: string}>> = {
    Fajr: Sunrise,
    Sunrise: Sunrise,
    Dhuhr: Sun,
    Asr: SunDim,
    Maghrib: Sunset,
    Isha: Moon,
};

const prayerOrder: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function PrayerTimeRow({ name, time, icon: Icon, isActive }: { name: string, time: string, icon: ComponentType<{className?: string}>, isActive: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3 rounded-lg transition-all duration-500 ease-in-out",
            isActive ? "bg-accent/20 scale-105 shadow-lg shadow-accent/10" : "hover:bg-primary/5"
        )}>
            <div className="flex items-center gap-4">
                <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-accent" : "text-primary/70")} />
                <span className={cn("text-lg font-headline transition-colors", isActive ? "font-bold text-accent-foreground" : "text-foreground")}>{name}</span>
            </div>
            <span className={cn("text-lg font-mono font-semibold transition-colors", isActive ? "text-accent" : "text-primary")}>{time}</span>
        </div>
    )
}

export function PrayerTimesCard({ prayerTimes, nextPrayer, currentPrayerName, date, locationDenied }: PrayerTimesCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/10 border-primary/20 bg-card/80 backdrop-blur-sm animate-in fade-in-50 duration-500">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-headline">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </CardTitle>
        <CardDescription>{locationDenied ? "Showing times for default location" : "Based on your current location"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Countdown nextPrayerName={nextPrayer.name} nextPrayerTime={nextPrayer.time} />

        <Separator />
        
        <div className="space-y-2">
            {prayerOrder.map((name) => (
                <PrayerTimeRow
                    key={name}
                    name={name}
                    time={prayerTimes[name]}
                    icon={prayerIcons[name]}
                    isActive={currentPrayerName === name}
                />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
