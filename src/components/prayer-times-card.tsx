
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrayerTimes, PrayerName } from "@/lib/prayer-times";
import { Countdown } from "./countdown";
import { cn } from "@/lib/utils";
import { PrayerOffsets } from "./options-menu";
import { Settings } from "lucide-react";

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
    const formattedTime = time.substring(0, 5); // Schneidet "hh:mm:ss" zu "hh:mm"
    return (
        <div className={cn(
            "flex items-center justify-between rounded-lg transition-all duration-500 ease-in-out py-1 px-4",
            isActive ? "border-2 border-destructive" : "hover:bg-primary/5"
        )}>
            <div className="w-1/3 text-right pr-1.5">
                <span className="font-bold text-black text-base">{name}</span>
            </div>
            <div className="w-1/3 text-center">
                <span className="font-bold text-black text-base">{formattedTime}</span>
            </div>
            <div className="w-1/3 text-right">
                <span className={cn("text-base font-bold text-right text-custom-blue")}>{offset}</span>
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

const formatHijriDate = (hijriDate: string): string => {
    const parts = hijriDate.split('/');
    if (parts.length !== 3) return hijriDate + ' H';
    
    const [year, month, day] = parts;
    const hijriMonths: { [key: number]: string } = {
        1: 'Muharram', 2: 'Safar', 3: 'Rabiʿ al-awwal', 4: 'Rabiʿ al-thani',
        5: 'Jumada al-awwal', 6: 'Jumada al-thani', 7: 'Rajab', 8: 'Shaʿban',
        9: 'Ramadan', 10: 'Shawwal', 11: 'Dhu al-Qiʿdah', 12: 'Dhu al-Ḥijjah'
    };
    
    const monthName = hijriMonths[parseInt(month, 10)];
    if (!monthName) return hijriDate + ' H';

    return `${parseInt(day, 10)}. ${monthName} ${year} H`;
};


function DateFader({ gregorian, hijri }: { gregorian: string, hijri: string }) {
    const [displayIndex, setDisplayIndex] = useState(0);
    const [opacity, setOpacity] = useState(0);

    const texts = [formatGermanDate(gregorian), formatHijriDate(hijri)];
    
    // Parametrierbare Zeiten aus dem JS-Code
    const FADE_IN_DURATION = 4000;
    const HOLD_DURATION = 1500;
    const FADE_OUT_MULTIPLIER = 0.7;
    const FADE_OUT_DURATION = FADE_IN_DURATION * FADE_OUT_MULTIPLIER;

    useEffect(() => {
        let fadeInTimer: NodeJS.Timeout;
        let fadeOutTimer: NodeJS.Timeout;
        let switchTextTimer: NodeJS.Timeout;

        const cycle = () => {
             // Set Text & Start Fade-In
            setOpacity(1);

            // Start Fade-Out-Timer
            fadeOutTimer = setTimeout(() => {
                setOpacity(0);
            }, FADE_IN_DURATION + HOLD_DURATION);

            // Start Text-Wechsel-Timer
            switchTextTimer = setTimeout(() => {
                setDisplayIndex((prevIndex) => (prevIndex + 1) % texts.length);
            }, FADE_IN_DURATION + HOLD_DURATION + FADE_OUT_DURATION);
        };
        
        // Initialer Fade-In
        fadeInTimer = setTimeout(cycle, 100);

        // Cleanup-Funktion
        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(switchTextTimer);
        };

    }, [displayIndex, gregorian, hijri]);

    return (
        <CardTitle 
            className="pt-2 text-lg text-black font-body h-14 flex items-center justify-center text-center"
            style={{ 
                opacity: opacity,
                transition: `opacity ${opacity === 1 ? FADE_IN_DURATION : FADE_OUT_DURATION}ms ease-in-out`
            }}
        >
            {texts[displayIndex]}
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
                <div className="font-bold text-black text-base">Shuruk</div>
                <div className="font-body font-bold text-black text-base">{prayerTimes.Shuruk.substring(0, 5)}</div>
            </div>
            <div className="text-center bg-mint-green/30 text-primary-foreground rounded-lg p-2 border border-black space-y-1 w-[45%]">
                <div className="font-bold text-black text-base">Jumuah</div>
                <div className="font-body font-bold text-black text-base">{jumuahTime}</div>
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
