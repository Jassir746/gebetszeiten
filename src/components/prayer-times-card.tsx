
import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrayerTimes, PrayerName } from "@/lib/prayer-times";
import { Countdown } from "./countdown";
import { cn } from "@/lib/utils";
import { PrayerOffsets } from "./options-menu";
import { Settings, Info, QrCode } from "lucide-react";

interface PrayerTimesCardProps {
  prayerTimes: PrayerTimes;
  nextPrayer: { name: PrayerName, time: Date };
  currentPrayer?: { name: PrayerName, time: Date };
  gregorianDate: string;
  now: Date;
  jumuahTime: string;
  prayerOffsets: PrayerOffsets;
  setIsOptionsOpen: (isOpen: boolean) => void;
  setIsInfoOpen: (isOpen: boolean) => void;
  setIsScannerOpen: (isOpen: boolean) => void;
  locationName: string;
}

const PRAYER_START_BLINK_DURATION_MS = 2 * 60 * 1000; // 2 minutes

const prayerOrder: PrayerName[] = ['Fadjr', 'Duhr', 'Assr', 'Maghrib', 'Ishaa'];

function getOffsetDisplay(offsetValue: string): string {
    const num = parseInt(offsetValue, 10);
    if (isNaN(num) || num === 0) return '';
    if (num > 0) return `+${num}`;
    return String(num);
}

function PrayerTimeRow({ name, time, isActive, isBlinking, offset }: { name: string, time: string, isActive: boolean, isBlinking: boolean, offset: string }) {
    const formattedTime = time.substring(0, 5);
    return (
        <div className={cn(
            "flex items-center justify-between rounded-lg transition-all duration-500 ease-in-out py-1 px-4",
            isActive && "border-2 border-destructive",
            isBlinking && "animate-blink-bg",
            !isActive && "hover:bg-primary/5"
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

const formatGermanDate = (dateString: string) => {
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' });
    } catch {
        return dateString;
    }
};

const formatHijriDate = (hijriDate: string): string => {
    if (!hijriDate) return 'Lädt...';
    
    const cleanedDate = hijriDate.replace('H', '').trim();
    
    const parts = cleanedDate.split('/');
    if (parts.length !== 3) return cleanedDate;
    
    const [year, month, day] = parts;
    const hijriMonths: { [key: number]: string } = {
        1: 'Muharram', 2: 'Safar', 3: 'Rabiʿ al-awwal', 4: 'Rabiʿ al-thani',
        5: 'Jumada al-awwal', 6: 'Jumada al-thani', 7: 'Rajab', 8: 'Shaʿban',
        9: 'Ramadan', 10: 'Shawwal', 11: 'Dhu al-Qiʿdah', 12: 'Dhu al-Ḥijjah'
    };
    
    const monthName = hijriMonths[parseInt(month, 10)];
    if (!monthName) return cleanedDate;

    return `${parseInt(day, 10)}. ${monthName} ${year}`;
};


function DateFader({ gregorian, hijri }: { gregorian: string, hijri: string }) {
    const [displayIndex, setDisplayIndex] = useState(0);
    const [opacity, setOpacity] = useState(0);

    const texts = useMemo(() => [formatGermanDate(gregorian), formatHijriDate(hijri)], [gregorian, hijri]);
    
    const FADE_IN_DURATION = 4000;
    const HOLD_DURATION = 1500;
    const FADE_OUT_MULTIPLIER = 0.7;
    const FADE_OUT_DURATION = FADE_IN_DURATION * FADE_OUT_MULTIPLIER;

    useEffect(() => {
        let fadeOutTimer: NodeJS.Timeout;
        let switchTextTimer: NodeJS.Timeout;

        const cycle = () => {
            setOpacity(1);

            fadeOutTimer = setTimeout(() => {
                setOpacity(0);
            }, FADE_IN_DURATION + HOLD_DURATION);

            switchTextTimer = setTimeout(() => {
                setDisplayIndex(prevIndex => (prevIndex + 1) % texts.length);
            }, FADE_IN_DURATION + HOLD_DURATION + FADE_OUT_DURATION);
        };
        
        const initialTimer = setTimeout(cycle, 100);

        return () => {
            clearTimeout(initialTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(switchTextTimer);
        };

    }, [displayIndex, texts]);

    return (
        <CardTitle 
            className="text-sm font-body h-8 flex items-center justify-center text-center rounded-md bg-[#5aa1a8] text-white p-2 w-full"
            style={{ 
                opacity: opacity,
                transition: `opacity ${opacity === 1 ? FADE_IN_DURATION : FADE_OUT_DURATION}ms ease-in-out`
            }}
        >
            {texts[displayIndex]}
        </CardTitle>
    );
}

export function PrayerTimesCard({ 
    prayerTimes, 
    nextPrayer, 
    currentPrayer, 
    gregorianDate, 
    now, 
    jumuahTime, 
    prayerOffsets, 
    setIsOptionsOpen, 
    setIsInfoOpen, 
    setIsScannerOpen,
    locationName 
}: PrayerTimesCardProps) {
  const [blinkingPrayer, setBlinkingPrayer] = useState<PrayerName | undefined>(undefined);
  const prevPrayer = useRef(currentPrayer);

  useEffect(() => {
    if (currentPrayer && currentPrayer.name !== prevPrayer.current?.name) {
      const timeSincePrayerStart = now.getTime() - currentPrayer.time.getTime();
      
      if (timeSincePrayerStart >= 0 && timeSincePrayerStart < PRAYER_START_BLINK_DURATION_MS) {
        setBlinkingPrayer(currentPrayer.name);
        
        const timer = setTimeout(() => {
          setBlinkingPrayer(undefined);
        }, PRAYER_START_BLINK_DURATION_MS - timeSincePrayerStart);
        
        return () => clearTimeout(timer);
      }
    }
    
    prevPrayer.current = currentPrayer;
  }, [currentPrayer, now]);


  return (
      <Card className="w-full max-w-[18.5rem] mx-auto shadow-2xl shadow-primary/10 bg-card/40 border-primary/20">
        <CardHeader className="text-center pb-2 relative">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
               <div className="w-1/3 text-left">
                  <button onClick={() => setIsInfoOpen(true)} className="p-2 text-custom-blue hover:text-accent transition-colors">
                      <Info className="w-6 h-6" />
                  </button>
              </div>
              <div className="w-1/3 text-center">
                  <button onClick={() => setIsOptionsOpen(true)} className="p-2 text-custom-blue hover:text-accent transition-colors">
                      <Settings className="w-6 h-6" />
                  </button>
              </div>
              <div className="w-1/3 text-right">
                  <button onClick={() => setIsScannerOpen(true)} className="p-2 text-custom-blue hover:text-accent transition-colors">
                      <QrCode className="w-6 h-6" />
                  </button>
              </div>
          </div>
          <div className="flex flex-col items-center space-y-2 pt-12">
              <Countdown nextPrayerName={nextPrayer.name} nextPrayerTime={nextPrayer.time} />
               <div className="w-full text-left">
                  <p className="font-bold text-base text-custom-blue pb-2">Gebetszeiten {locationName}</p>
              </div>

              <div className={cn(
                  "bg-mint-green/30 text-primary-foreground rounded-lg px-2 pt-2 pb-1 border border-black flex flex-col items-center space-y-1 w-full"
              )}>
                  <DateFader gregorian={gregorianDate} hijri={prayerTimes.Hijri_Date} />
                  <CardDescription className="text-sm font-body tracking-wider text-black font-bold">
                    {now.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})} &nbsp;
                    {now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit'})}
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 py-2">
              {prayerOrder.map((name) => (
                  <PrayerTimeRow
                      key={name}
                      name={name}
                      isActive={currentPrayer?.name === name}
                      isBlinking={blinkingPrayer === name}
                      offset={getOffsetDisplay(prayerOffsets[name])}
                      time={prayerTimes[name]}
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
          <div className="mt-4 mx-4">
            <div className="flex flex-col items-end w-full">
              <a href="https://app.izaachen.de" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center gap-2 text-black text-sm hover:text-accent transition-colors underline">
                  <span className="text-lg">☪</span>
                  app.izaachen.de
              </a>
              <p className="text-xs text-muted-foreground font-bold">{locationName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
