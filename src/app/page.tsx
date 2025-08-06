'use client';

import { useState, useEffect } from 'react';
import { PrayerTimes, PrayerName, getNextPrayerInfo } from '@/lib/prayer-times';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { OptionsMenu, PrayerOffsets } from '@/components/options-menu';

// Hardcoded placeholder data to ensure the UI renders.
const placeholderPrayerTimes: PrayerTimes = {
    Fadjr: "05:30",
    Shuruk: "07:00",
    Duhr: "13:30",
    Assr: "17:30",
    Maghrib: "20:30",
    Ishaa: "22:00",
};

interface PrayerInfo {
    nextPrayer: { name: PrayerName; time: Date };
    currentPrayer?: { name: PrayerName; time: Date };
}

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(placeholderPrayerTimes);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Set to false initially
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
    // This effect now only handles the timer and prayer info calculation.
    if (prayerTimes) {
        const currentPrayerInfo = getNextPrayerInfo(prayerTimes);
        setPrayerInfo(currentPrayerInfo);
        
        const timer = setInterval(() => {
            const currentDate = new Date();
            setNow(currentDate);
            // Recalculate prayer info every second for the countdown
            const updatedPrayerInfo = getNextPrayerInfo(prayerTimes);
            setPrayerInfo(updatedPrayerInfo);
        }, 1000);

        return () => clearInterval(timer);
    }
  }, [prayerTimes]);

  // UI rendering logic
  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full max-w-sm mx-auto">
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
          locationDenied={locationDenied}
          jumuahTime={jumuahTime}
          prayerOffsets={prayerOffsets}
          setIsOptionsOpen={setIsOptionsOpen}
        />
      );
    }

    // Fallback in case something is still wrong
    return (
        <div className="w-full max-w-sm mx-auto bg-card/80 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold">Fehler beim Laden</h3>
            <p className="text-card-foreground">Die Gebetszeiten-Komponente konnte nicht gerendert werden.</p>
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
