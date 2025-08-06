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
    <div className="text-right w-full">
        <p className="font-bold font-headline text-black text-lg">
            <span>{nextPrayerName} in:</span>
            <span className="font-body tracking-tighter"> {timeLeft}</span>
        </p>
    </div>
  );
}
