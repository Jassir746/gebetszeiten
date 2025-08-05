'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  nextPrayerName: string;
  nextPrayerTime: Date;
}

const formatTime = (timeInSeconds: number): string => {
    if (timeInSeconds < 0) return '00:00:00';

    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function Countdown({ nextPrayerName, nextPrayerTime }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = nextPrayerTime.getTime() - new Date().getTime();
      return formatTime(difference / 1000);
    };

    // Set initial value
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [nextPrayerTime]);

  return (
    <div className="text-center space-y-1">
      <p className="text-lg text-foreground/80 font-headline">Zeit bis {nextPrayerName}</p>
      <p className="text-5xl font-bold font-headline text-primary tracking-tighter">{timeLeft}</p>
    </div>
  );
}
