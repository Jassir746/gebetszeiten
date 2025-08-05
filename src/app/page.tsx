'use client';

import { useState, useEffect } from 'react';
import { getPrayerTimes, getNextPrayerInfo, PrayerTimes, PrayerName } from '@/lib/prayer-times';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { OptionsMenu, PrayerOffsets } from '@/components/options-menu';
import { Settings } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
}

interface PrayerInfo {
    nextPrayer: { name: PrayerName; time: Date };
    currentPrayer?: { name: PrayerName; time: Date };
}

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null);
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
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setError("Standortzugriff verweigert. Es werden Zeiten für einen Standardstandort angezeigt.");
          setLocation({ latitude: 51.5136, longitude: 7.4653 }); // Dortmund
        }
      );
    } else {
      setError("Geolocation wird nicht unterstützt. Es werden Zeiten für einen Standardstandort angezeigt.");
      setLocation({ latitude: 51.5136, longitude: 7.4653 }); // Dortmund
    }
  }, []);

  useEffect(() => {
    if (location) {
      const fetchTimes = async () => {
        setLoading(true);
        try {
          const times = await getPrayerTimes(date, location.latitude, location.longitude);
          setPrayerTimes(times);
          // Clear previous errors on successful fetch
          if (!error?.includes('verweigert')) {
            setError(null);
          }
        } catch (err) {
          setError("Gebetszeiten konnten nicht abgerufen werden. Bitte versuchen Sie es später noch einmal.");
        }
      };
      fetchTimes();
    }
  }, [location, date]);

  useEffect(() => {
      if (prayerTimes) {
          setPrayerInfo(getNextPrayerInfo(prayerTimes));
          setLoading(false);

          const timer = setInterval(() => {
              const currentDate = new Date();
              setNow(currentDate);
              setPrayerInfo(getNextPrayerInfo(prayerTimes));
              
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
        <div className="w-full w-[22.4rem] mx-auto">
          <Skeleton className="h-[550px] w-full rounded-xl bg-primary/10" />
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
          locationDenied={!!error?.includes('verweigert')}
          jumuahTime={jumuahTime}
          prayerOffsets={prayerOffsets}
        />
      );
    }

    return null;
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-transparent p-4 sm:p-8 font-body">
       <OptionsMenu
        isOpen={isOptionsOpen}
        setIsOpen={setIsOptionsOpen}
        jumuahTime={jumuahTime}
        setJumuahTime={setJumuahTime}
        prayerOffsets={prayerOffsets}
        setPrayerOffsets={setPrayerOffsets}
      />
      <div className="text-center mb-8 relative w-full w-[22.4rem]">
        <h1 className="text-2xl font-bold text-primary">
          Gebetszeiten Dortmund
        </h1>
        <button onClick={() => setIsOptionsOpen(true)} className="absolute top-0 right-0 p-2 text-primary hover:text-accent transition-colors">
            <Settings className="w-6 h-6" />
        </button>
      </div>
      
      {renderContent()}
    </main>
  );
}
