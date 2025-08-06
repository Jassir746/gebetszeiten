
'use client';

import { useState, useEffect } from 'react';
import { PrayerTimes, PrayerName, getNextPrayerInfo, getFormattedDate } from '@/lib/prayer-times';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { OptionsMenu, PrayerOffsets } from '@/components/options-menu';
import { InfoDialog } from '@/components/info-dialog';
import { fetchPrayerTimesAPI, YearPrayerTimes } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface PrayerInfo {
    nextPrayer: { name: PrayerName; time: Date };
    currentPrayer?: { name: PrayerName; time: Date };
}

const PRAYER_TIMES_STORAGE_KEY = 'prayerTimesData';
const SETTINGS_STORAGE_KEY = 'prayerAppSettings';

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [tomorrowPrayerTimes, setTomorrowPrayerTimes] = useState<PrayerTimes | null>(null);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [date] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const { toast } = useToast();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // Default states
  const [jumuahTime, setJumuahTime] = useState('14:00');
  const [prayerOffsets, setPrayerOffsets] = useState<PrayerOffsets>({
    Fadjr: '+30',
    Duhr: '+10',
    Assr: '+10',
    Maghrib: '+5',
    Ishaa: '+10',
  });
  const [deactivateAssrEarly, setDeactivateAssrEarly] = useState(true);
  const [deactivateIshaaAtMidnight, setDeactivateIshaaAtMidnight] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);

  // Load settings from localStorage on initial mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        if (settings.jumuahTime) setJumuahTime(settings.jumuahTime);
        if (settings.prayerOffsets) setPrayerOffsets(settings.prayerOffsets);
        if (typeof settings.deactivateAssrEarly === 'boolean') setDeactivateAssrEarly(settings.deactivateAssrEarly);
        if (typeof settings.deactivateIshaaAtMidnight === 'boolean') setDeactivateIshaaAtMidnight(settings.deactivateIshaaAtMidnight);
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settings = {
        jumuahTime,
        prayerOffsets,
        deactivateAssrEarly,
        deactivateIshaaAtMidnight
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings to localStorage", e);
    }
  }, [jumuahTime, prayerOffsets, deactivateAssrEarly, deactivateIshaaAtMidnight]);

  useEffect(() => {
    const fetchAndStoreTimes = async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const year = today.getFullYear().toString();
      const todayFormatted = getFormattedDate(today);
      const tomorrowFormatted = getFormattedDate(tomorrow);

      let loadedFromStorage = false;

      // 1. Try to load from localStorage first
      try {
        const storedData = localStorage.getItem(PRAYER_TIMES_STORAGE_KEY);
        if (storedData) {
          const parsedData: YearPrayerTimes = JSON.parse(storedData);
          const yearData = parsedData[year];
          if (yearData && yearData[todayFormatted]) {
            setPrayerTimes(yearData[todayFormatted]);
            if (yearData[tomorrowFormatted]) {
              setTomorrowPrayerTimes(yearData[tomorrowFormatted]);
            }
            setLoading(false);
            loadedFromStorage = true;
          }
        }
      } catch (e) {
        console.error("Failed to read from localStorage", e);
      }
      
      // 2. Fetch from API to get fresh data for current year and next year if needed
      try {
        setError(null);
        let yearlyData = await fetchPrayerTimesAPI(today);
        
        // If it's the end of the year, we need next year's data for tomorrow's Fadjr
        if (today.getMonth() === 11 && today.getDate() === 31) {
            const nextYearData = await fetchPrayerTimesAPI(tomorrow);
            yearlyData = {...yearlyData, ...nextYearData};
        }

        localStorage.setItem(PRAYER_TIMES_STORAGE_KEY, JSON.stringify(yearlyData));

        const todayYearData = yearlyData[year];
        const tomorrowYear = tomorrow.getFullYear().toString();
        const tomorrowYearData = yearlyData[tomorrowYear];

        if (todayYearData && todayYearData[todayFormatted]) {
           setPrayerTimes(todayYearData[todayFormatted]);
        } else {
            throw new Error(`Keine Gebetszeiten für heute (${todayFormatted}) in den API-Daten gefunden.`);
        }
        
        if (tomorrowYearData && tomorrowYearData[tomorrowFormatted]) {
            setTomorrowPrayerTimes(tomorrowYearData[tomorrowFormatted]);
        } else {
            // This might happen at the end of the year, but we've already fetched next year's data
             if (!loadedFromStorage) { // only error if we dont have stale data
                console.warn(`Keine morgigen Gebetszeiten (${tomorrowFormatted}) gefunden. Mitternachtsberechnung könnte ungenau sein.`);
             }
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.";
        if (!loadedFromStorage) {
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Fehler beim Laden der Gebetszeiten",
                description: errorMessage,
            });
        }
        console.error("API Fetch failed, using stale data if available.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndStoreTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  useEffect(() => {
    const timer = setInterval(() => {
        setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerTimes) {
        const currentPrayerInfo = getNextPrayerInfo(
            prayerTimes,
            new Date(), // Use a fresh Date for calculation
            {
              deactivateAssrEarly,
              deactivateIshaaAtMidnight,
              tomorrowFadjr: tomorrowPrayerTimes?.Fadjr ?? '05:30' // Provide fallback
            }
        );
        setPrayerInfo(currentPrayerInfo);
    }
  }, [prayerTimes, tomorrowPrayerTimes, deactivateAssrEarly, deactivateIshaaAtMidnight, now]);


  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full max-w-sm mx-auto">
          <Skeleton className="h-[550px] w-full rounded-xl bg-primary/10" />
        </div>
      );
    }

    if (error && !prayerTimes) { // Only show full-screen error if no data is available
       return (
         <Card className="w-full w-[20rem] mx-auto shadow-2xl shadow-destructive/20 bg-card/40 border-destructive/50">
           <CardHeader className="text-center pb-4">
             <div className="flex flex-col items-center text-destructive">
                <AlertTriangle className="w-12 h-12 mb-4" />
                <CardTitle className="text-lg">Fehler</CardTitle>
             </div>
           </CardHeader>
           <CardContent className="text-center">
             <p>Gebetszeiten konnten nicht vom Server geladen werden.</p>
             <p className="text-xs text-muted-foreground mt-2">{error}</p>
           </CardContent>
         </Card>
       );
    }
    
    if (prayerTimes && prayerInfo) {
      return (
        <PrayerTimesCard
          prayerTimes={prayerTimes}
          nextPrayer={prayerInfo.nextPrayer}
          currentPrayerName={prayerInfo.currentPrayer?.name}
          gregorianDate={getFormattedDate(date)}
          now={now}
          locationDenied={locationDenied}
          jumuahTime={jumuahTime}
          prayerOffsets={prayerOffsets}
          setIsOptionsOpen={setIsOptionsOpen}
          setIsInfoOpen={setIsInfoOpen}
        />
      );
    }

    return null; 
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-transparent p-8 font-body">
       <OptionsMenu
        isOpen={isOptionsOpen}
        setIsOpen={setIsOptionsOpen}
        jumuahTime={jumuahTime}
        setJumuahTime={setJumuahTime}
        prayerOffsets={prayerOffsets}
        setPrayerOffsets={setPrayerOffsets}
        deactivateAssrEarly={deactivateAssrEarly}
        setDeactivateAssrEarly={setDeactivateAssrEarly}
        deactivateIshaaAtMidnight={deactivateIshaaAtMidnight}
        setDeactivateIshaaAtMidnight={setDeactivateIshaaAtMidnight}
      />
      <InfoDialog isOpen={isInfoOpen} setIsOpen={setIsInfoOpen} />
      {renderContent()}
    </main>
  );
}
