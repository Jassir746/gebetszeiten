
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
        title: "Hinweis",
        description: error,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    // Geolocation is not strictly needed for the API call anymore,
    // but we can keep it to show a message if access was denied.
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationDenied(false);
        },
        () => {
          setError("Standortzugriff verweigert. Gebetszeiten für Dortmund werden angezeigt.");
          setLocationDenied(true);
        }
      );
    } else {
      // Geolocation is not supported
      setLocationDenied(true);
    }
  }, []);

  useEffect(() => {
    const fetchTimes = async () => {
      setLoading(true);
      setError(null); // Reset error state before fetching
      try {
        const times = await fetchPrayerTimesAPI(date);
        setPrayerTimes(times);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.";
        setError(`Gebetszeiten konnten nicht abgerufen werden: ${errorMessage}`);
        setPrayerTimes(null); // Ensure we clear old data on error
      } finally {
        setLoading(false);
      }
    };
    fetchTimes();
  }, [date]);

  useEffect(() => {
      if (prayerTimes) {
          setError(null); // We got data, so clear any previous errors.
          setPrayerInfo(getNextPrayerInfo(prayerTimes));
          
          const timer = setInterval(() => {
              const currentDate = new Date();
              setNow(currentDate);
              // We need to get the info based on the latest prayer times
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
        )
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

    return null; // Should not be reached if logic is correct
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
