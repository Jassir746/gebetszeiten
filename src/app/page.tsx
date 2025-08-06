
'use client';

import { useState, useEffect } from 'react';
import { PrayerTimes, PrayerName, getNextPrayerInfo } from '@/lib/prayer-times';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { OptionsMenu, PrayerOffsets } from '@/components/options-menu';
import { fetchPrayerTimesAPI } from '@/app/actions';

interface PrayerInfo {
    nextPrayer: { name: PrayerName; time: Date };
    currentPrayer?: { name: PrayerName; time: Date };
}

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState(new Date());
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
    if (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationDenied(false);
        },
        () => {
          // No need to set an error here, as the API call doesn't depend on it.
          // We can just note that access was denied.
          setLocationDenied(true);
        }
      );
    } else {
      setLocationDenied(true);
    }
  }, []);

  useEffect(() => {
    const fetchTimes = async () => {
      setLoading(true);
      setError(null);
      try {
        const times = await fetchPrayerTimesAPI(date);
        setPrayerTimes(times);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.";
        setError(errorMessage); // Set the specific error message
        setPrayerTimes(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTimes();
  }, [date]);

  useEffect(() => {
      if (prayerTimes) {
          setError(null);
          setPrayerInfo(getNextPrayerInfo(prayerTimes));
          
          const timer = setInterval(() => {
              const currentDate = new Date();
              setNow(currentDate);
              const currentPrayerInfo = getNextPrayerInfo(prayerTimes);
              setPrayerInfo(currentPrayerInfo);
              
              if(currentDate.getDate() !== date.getDate()) {
                  setDate(currentDate);
              }
          }, 1000);

          return () => clearInterval(timer);
      }
  }, [prayerTimes, date]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full w-[20rem] mx-auto">
          <Skeleton className="h-[550px] w-full rounded-xl bg-primary/10" />
        </div>
      );
    }

    if (error) {
        return (
             <div className="w-full w-[20rem] mx-auto bg-card/80 p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-bold text-destructive">Fehler</h3>
                <p className="text-card-foreground">{error}</p>
             </div>
        );
    }

    if (prayerTimes && prayerInfo?.nextPrayer) {
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

    // Fallback for the case where there's no loading, no error, but also no data.
    // This prevents the UI from crashing.
    return (
        <div className="w-full w-[20rem] mx-auto bg-card/80 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold">Keine Daten</h3>
            <p className="text-card-foreground">Es konnten keine Gebetszeiten geladen werden.</p>
        </div>
    );
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
