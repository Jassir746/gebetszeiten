'use client';

import { useState, useEffect } from 'react';
import { getPrayerTimes, getNextPrayerInfo, PrayerTimes, PrayerName } from '@/lib/prayer-times';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";

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
        <div className="w-full max-w-md mx-auto">
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
        />
      );
    }

    return null;
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8 font-body">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-background to-background -z-10"></div>
      <div className="text-center mb-8">
        <h1 className="text-[0.9em] font-bold text-primary">
          Gebetszeiten Dortmund
        </h1>
      </div>
      
      {renderContent()}
    </main>
  );
}
