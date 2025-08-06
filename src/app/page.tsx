
'use client';

import { useState, useEffect } from 'react';
import { PrayerTimes, PrayerName, getNextPrayerInfo, getFormattedDate } from '@/lib/prayer-times';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { OptionsMenu, PrayerOffsets } from '@/components/options-menu';
import { fetchPrayerTimesAPI, YearPrayerTimes } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface PrayerInfo {
    nextPrayer: { name: PrayerName; time: Date };
    currentPrayer?: { name: PrayerName; time: Date };
}

const PRAYER_TIMES_STORAGE_KEY = 'prayerTimesData';

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [date] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const { toast } = useToast();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  
  const [jumuahTime, setJumuahTime] = useState('14:00');
  const [prayerOffsets, setPrayerOffsets] = useState<PrayerOffsets>({
    Fadjr: '+30',
    Duhr: '+10',
    Assr: '+10',
    Maghrib: '+5',
    Ishaa: '+10',
  });
  const [locationDenied, setLocationDenied] = useState(false);


  useEffect(() => {
    const fetchAndStoreTimes = async () => {
      const today = new Date();
      const year = today.getFullYear().toString();
      const todayFormatted = getFormattedDate(today);
      let loadedFromStorage = false;

      // 1. Try to load from localStorage first
      try {
        const storedData = localStorage.getItem(PRAYER_TIMES_STORAGE_KEY);
        if (storedData) {
          const parsedData: YearPrayerTimes = JSON.parse(storedData);
          const yearData = parsedData[year];
          if (yearData && yearData[todayFormatted]) {
            setPrayerTimes(yearData[todayFormatted]);
            setLoading(false); // We have data, so stop initial loading
            loadedFromStorage = true;
          }
        }
      } catch (e) {
        console.error("Failed to read from localStorage", e);
      }
      
      // 2. Fetch from API to get fresh data
      try {
        setError(null);
        const yearlyData = await fetchPrayerTimesAPI(today);
        
        // Save to localStorage
        try {
          localStorage.setItem(PRAYER_TIMES_STORAGE_KEY, JSON.stringify(yearlyData));
        } catch (e) {
          console.error("Failed to save to localStorage", e);
        }

        // Update state with today's times from the fresh data
        const yearData = yearlyData[year];
        if (yearData && yearData[todayFormatted]) {
           setPrayerTimes(yearData[todayFormatted]);
        } else {
            throw new Error(`Keine Gebetszeiten für heute (${todayFormatted}) in den API-Daten gefunden.`);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.";
        // Only show error if we don't have ANY data to show
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
        setLoading(false); // Stop loading in any case
      }
    };

    fetchAndStoreTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
  

  useEffect(() => {
    // This effect handles the timer to update the current time.
    const timer = setInterval(() => {
        setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // This effect recalculates prayer info ONLY when prayer times are loaded/changed.
    // It is now decoupled from the 'now' state to prevent re-renders every second.
    if (prayerTimes) {
        const currentPrayerInfo = getNextPrayerInfo(prayerTimes, new Date()); // Use a fresh Date here
        setPrayerInfo(currentPrayerInfo);
    }
  }, [prayerTimes]); // This hook depends ONLY on prayerTimes.

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
      />
      {renderContent()}
    </main>
  );
}
