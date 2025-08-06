
'use client';

import { useState, useEffect } from 'react';
import { PrayerTimes, PrayerName, getNextPrayerInfo } from '@/lib/prayer-times';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { OptionsMenu, PrayerOffsets } from '@/components/options-menu';
import { fetchPrayerTimesAPI } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface PrayerInfo {
    nextPrayer: { name: PrayerName; time: Date };
    currentPrayer?: { name: PrayerName; time: Date };
}

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
    const fetchTimes = async () => {
      try {
        setLoading(true);
        setError(null);
        // Wir übergeben das aktuelle Datum an die API-Funktion
        const times = await fetchPrayerTimesAPI(new Date());
        setPrayerTimes(times);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.";
        setError(errorMessage);
        toast({
            variant: "destructive",
            title: "Fehler beim Laden der Gebetszeiten",
            description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimes();
  }, [toast]); // `date` entfernt, da wir immer das aktuelle Datum wollen
  

  useEffect(() => {
    // This effect handles the timer and prayer info calculation.
    if (prayerTimes) {
        const currentPrayerInfo = getNextPrayerInfo(prayerTimes);
        setPrayerInfo(currentPrayerInfo);
    }
    // This runs regardless of prayer times being available to keep the clock ticking
    const timer = setInterval(() => {
        const currentDate = new Date();
        setNow(currentDate);
        // Recalculate prayer info every second for the countdown if times are available
        if (prayerTimes) {
            const updatedPrayerInfo = getNextPrayerInfo(prayerTimes);
            setPrayerInfo(updatedPrayerInfo);
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerTimes]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full max-w-sm mx-auto">
          <Skeleton className="h-[550px] w-full rounded-xl bg-primary/10" />
        </div>
      );
    }

    if (error) {
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
          date={date}
          now={now}
          locationDenied={locationDenied}
          jumuahTime={jumuahTime}
          prayerOffsets={prayerOffsets}
          setIsOptionsOpen={setIsOptionsOpen}
        />
      );
    }

    return null; // Should not be reached in normal flow
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
