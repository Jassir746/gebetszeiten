
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrayerTimes, PrayerName } from "@/lib/prayer-times";
import { Countdown } from "./countdown";
import { cn } from "@/lib/utils";
import { PrayerOffsets } from "./options-menu";
import { Settings } from "lucide-react";
import { format as formatDate } from 'date-fns';

interface PrayerTimesCardProps {
  prayerTimes: PrayerTimes;
  nextPrayer: { name: PrayerName, time: Date };
  currentPrayerName?: PrayerName;
  gregorianDate: string;
  now: Date;
  locationDenied?: boolean;
  jumuahTime: string;
  prayerOffsets: PrayerOffsets;
  setIsOptionsOpen: (isOpen: boolean) => void;
}

const prayerOrder: PrayerName[] = ['Fadjr', 'Duhr', 'Assr', 'Maghrib', 'Ishaa'];

function getOffsetDisplay(offsetValue: string): string {
    const num = parseInt(offsetValue, 10);
    if (isNaN(num) || num === 0) return '';
    if (num > 0) return `+${num}`;
    return String(num);
}

function PrayerTimeRow({ name, time, isActive, offset }: { name: string, time: string, isActive: boolean, offset: string }) {
    return (
        <div className={cn(
            "flex items-center justify-between rounded-lg transition-all duration-500 ease-in-out py-1 px-4",
            isActive ? "border-2 border-destructive" : "hover:bg-primary/5"
        )}>
            <div className="w-1/3 text-right">
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

// Formatiert das Datum aus der API (YYYY-MM-DD) in ein lesbares deutsches Format.
const formatGermanDate = (dateString: string) => {
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' });
    } catch {
        return dateString; // Fallback
    }
};

const formatHijriDate = (dateString: string) => {
    const formatted = dateString.replace(/\//g, '.');
    return `${formatted} (H)`;
}


function DateFader({ gregorian, hijri }: { gregorian: string, hijri: string }) {
    const [displayDate, setDisplayDate] = useState('');
    const [isGregorian, setIsGregorian] = useState(true);

    useEffect(() => {
        const gregorianFormatted = formatGermanDate(gregorian);
        const hijriFormatted = formatHijriDate(hijri);

        setDisplayDate(gregorianFormatted); // Start with Gregorian

        const intervalId = setInterval(() => {
            setIsGregorian(prev => {
                setDisplayDate(!prev ? gregorianFormatted : hijriFormatted);
                return !prev;
            });
        }, 5000); // Fades every 5 seconds

        return () => clearInterval(intervalId);
    }, [gregorian, hijri]);

    return (
        <CardTitle className="pt-2 text-lg text-black font-body transition-opacity duration-1000 h-14 flex items-center justify-center text-center">
            {displayDate}
        </CardTitle>
    );
}

export function PrayerTimesCard({ prayerTimes, nextPrayer, currentPrayerName, gregorianDate, now, locationDenied, jumuahTime, prayerOffsets, setIsOptionsOpen }: PrayerTimesCardProps) {
  return (
    <Card className="w-full w-[20rem] mx-auto shadow-2xl shadow-primary/10 bg-card/40 border-primary/20">
      <CardHeader className="text-center pb-2 relative">
         <button onClick={() => setIsOptionsOpen(true)} className="absolute top-4 right-4 p-2 text-primary hover:text-accent transition-colors">
            <Settings className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center space-y-2 pt-6">
            <Countdown nextPrayerName={nextPrayer.name} nextPrayerTime={nextPrayer.time} />
             <div className="w-full text-left">
                <p className="font-bold text-custom-blue text-lg">Gebetszeiten Dortmund</p>
            </div>
            <DateFader gregorian={gregorianDate} hijri={prayerTimes.Hijri_Date} />
            <CardDescription className="text-lg font-bold font-body tracking-wider text-black">
              {now.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})} &nbsp;
              {now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit'})}
            </CardDescription>
        </div>
        <CardDescription>{locationDenied ? "Es werden die Zeiten für den Standardstandort angezeigt" : ""}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 py-2">
            {prayerOrder.map((name) => (
                <PrayerTimeRow
                    key={name}
                    name={name}
                    time={prayerTimes[name]}
                    isActive={currentPrayerName === name}
                    offset={getOffsetDisplay(prayerOffsets[name])}
                />
            ))}
        </div>
        <div className="flex justify-between gap-4 mx-4 pt-2">
            <div className="text-center bg-mint-green/30 text-primary-foreground rounded-lg p-2 border border-black space-y-1 w-[45%]">
                <div className="font-bold text-black text-lg">Shuruk</div>
                <div className="font-body font-bold text-black text-lg">{prayerTimes.Shuruk}</div>
            </div>
            <div className="text-center bg-mint-green/30 text-primary-foreground rounded-lg p-2 border border-black space-y-1 w-[45%]">
                <div className="font-bold text-black text-lg">Jumuah</div>
                <div className="font-body font-bold text-black text-lg">{jumuahTime}</div>
            </div>
        </div>
        <div className="flex justify-end items-center gap-2 mt-4 mx-4">
            <span className="text-lg">☪</span>
            <a href="https://app.izaachen.de" target="_blank" rel="noopener noreferrer" className="text-black text-sm hover:text-accent transition-colors underline">
                app.izaachen.de
            </a>
        </div>
      </CardContent>
    </Card>
  );
}
