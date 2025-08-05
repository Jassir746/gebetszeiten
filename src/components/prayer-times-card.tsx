import type { ComponentType } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrayerTimes, PrayerName } from "@/lib/prayer-times";
import { Countdown } from "./countdown";
import { Separator } from "@/components/ui/separator";
import { Sunrise, Sun, SunDim, Sunset, Moon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { PrayerOffsets } from "./options-menu";


interface PrayerTimesCardProps {
  prayerTimes: PrayerTimes;
  nextPrayer: { name: PrayerName, time: Date };
  currentPrayerName?: PrayerName;
  date: Date;
  now: Date;
  locationDenied?: boolean;
  jumuahTime: string;
  prayerOffsets: PrayerOffsets;
}

const prayerIcons: Record<PrayerName, ComponentType<{className?: string}>> = {
    Fadjr: Sunrise,
    Shuruk: Sunrise,
    Duhr: Sun,
    Assr: SunDim,
    Maghrib: Sunset,
    Ishaa: Moon,
};

const prayerOrder: PrayerName[] = ['Fadjr', 'Duhr', 'Assr', 'Maghrib', 'Ishaa'];

function PrayerTimeRow({ name, time, icon: Icon, isActive, offset }: { name: string, time: string, icon: ComponentType<{className?: string}>, isActive: boolean, offset: string }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3 rounded-lg transition-all duration-500 ease-in-out",
            isActive ? "bg-primary/20 scale-105 shadow-lg shadow-primary/10" : "hover:bg-primary/5"
        )}>
            <div className="flex items-center gap-4 w-1/3">
                <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-primary" : "text-primary/70")} />
                <span className={cn("text-lg font-bold transition-colors", isActive ? "text-primary-foreground" : "font-bold text-black")}>{name}</span>
            </div>
            <div className="w-1/3 text-center">
                <span className={cn("text-lg font-bold transition-colors", isActive ? "text-primary-foreground" : "font-bold text-black")}>{time}</span>
            </div>
            <div className="flex items-center justify-end gap-4 w-1/3">
                <span className={cn("text-lg font-bold text-primary text-right", isActive ? "text-primary" : "text-primary")}>{offset}</span>
            </div>
        </div>
    )
}

export function PrayerTimesCard({ prayerTimes, nextPrayer, currentPrayerName, date, now, locationDenied, jumuahTime, prayerOffsets }: PrayerTimesCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/10 border-primary/20 bg-card/80 backdrop-blur-sm animate-in fade-in-50 duration-500">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center space-y-2 mb-4">
            <Countdown nextPrayerName={nextPrayer.name} nextPrayerTime={nextPrayer.time} />
            <CardTitle className="pt-2 text-xl">
              {date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' })}
            </CardTitle>
            <CardDescription className="text-xl font-bold font-mono tracking-wider">
              {now.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})} &nbsp;
              {now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit'})}
            </CardDescription>
        </div>
        <CardDescription>{locationDenied ? "Es werden die Zeiten für den Standardstandort angezeigt" : ""}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <Separator />
        
        <div className="space-y-2">
            {prayerOrder.map((name) => (
                <PrayerTimeRow
                    key={name}
                    name={name}
                    time={prayerTimes[name]}
                    icon={prayerIcons[name]}
                    isActive={currentPrayerName === name}
                    offset={prayerOffsets[name]}
                />
            ))}
        </div>
        <Separator />
        <div className="flex justify-between gap-4 mx-4">
            <div className="text-center bg-primary text-primary-foreground rounded-lg p-3 border border-black space-y-1 w-[45%]">
                <div className="font-bold">Shuruk</div>
                <div className="font-mono font-bold">{prayerTimes.Shuruk}</div>
            </div>
            <div className="text-center bg-primary text-primary-foreground rounded-lg p-3 border border-black space-y-1 w-[45%]">
                <div className="font-bold">Jumuah</div>
                <div className="font-mono font-bold">{jumuahTime}</div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
