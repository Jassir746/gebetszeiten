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

function getOffsetDisplay(offsetValue: string): string {
    const num = parseInt(offsetValue, 10);
    if (isNaN(num) || num === 0) return '';
    if (num > 0) return `+${num}`;
    return String(num);
}

function PrayerTimeRow({ name, time, icon: Icon, isActive, offset }: { name: string, time: string, icon: ComponentType<{className?: string}>, isActive: boolean, offset: string }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-1 rounded-lg transition-all duration-500 ease-in-out",
            isActive ? "border-2 border-destructive" : "hover:bg-primary/5"
        )}>
            <div className="flex items-center gap-4 w-1/3">
                <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-primary" : "text-primary/70")} />
                <span className="font-bold text-black text-lg">{name}</span>
            </div>
            <div className="w-1/3 text-center">
                <span className="font-bold text-black text-lg">{time}</span>
            </div>
            <div className="w-1/3 text-right">
                <span className={cn("text-lg font-bold text-right text-custom-blue")}>{offset}</span>
            </div>
        </div>
    )
}

export function PrayerTimesCard({ prayerTimes, nextPrayer, currentPrayerName, date, now, locationDenied, jumuahTime, prayerOffsets }: PrayerTimesCardProps) {
  return (
    <Card className="w-full max-w-xs mx-auto shadow-2xl shadow-primary/10 border-primary/20">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center space-y-2 mb-4">
            <Countdown nextPrayerName={nextPrayer.name} nextPrayerTime={nextPrayer.time} />
             <div className="w-full text-left">
                <p className="font-bold text-custom-blue text-lg">Gebetszeiten Dortmund</p>
            </div>
            <CardTitle className="pt-2 text-xl text-black">
              {date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' })}
            </CardTitle>
            <CardDescription className="text-xl font-bold font-mono tracking-wider text-black">
              {now.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})} &nbsp;
              {now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit'})}
            </CardDescription>
        </div>
        <CardDescription>{locationDenied ? "Es werden die Zeiten für den Standardstandort angezeigt" : ""}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Separator />
        
        <div className="space-y-0">
            {prayerOrder.map((name) => (
                <PrayerTimeRow
                    key={name}
                    name={name}
                    time={prayerTimes[name]}
                    icon={prayerIcons[name]}
                    isActive={currentPrayerName === name}
                    offset={getOffsetDisplay(prayerOffsets[name])}
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
