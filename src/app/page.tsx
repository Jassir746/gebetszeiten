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
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Notice",
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
          setError("Location access denied. Showing times for a default location.");
          setLocation({ latitude: 21.4225, longitude: 39.8262 }); // Mecca
        }
      );
    } else {
      setError("Geolocation is not supported. Showing times for a default location.");
      setLocation({ latitude: 21.4225, longitude: 39.8262 }); // Mecca
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
          if (!error?.includes('denied')) {
            setError(null);
          }
        } catch (err) {
          setError("Could not fetch prayer times. Please try again later.");
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
              setPrayerInfo(getNextPrayerInfo(prayerTimes));
              
              const now = new Date();
              if(now.getDate() !== date.getDate()) {
                  setDate(now);
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
          locationDenied={!!error?.includes('denied')}
        />
      );
    }

    return null;
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8 font-body">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-background to-background -z-10"></div>
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary mb-2">
          PrayerTime Pal
        </h1>
        <p className="text-muted-foreground mb-8">Your companion for timely prayers.</p>
      </div>
      
      {renderContent()}
    </main>
  );
}
