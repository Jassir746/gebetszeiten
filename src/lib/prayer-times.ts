
export type PrayerName = 'Fadjr' | 'Shuruk' | 'Duhr' | 'Assr' | 'Maghrib' | 'Ishaa';

// Erweitert, um die zusätzlichen Daten aus der API aufzunehmen
export interface PrayerTimes {
    Fadjr: string;
    Shuruk: string;
    Duhr: string;
    Assr: string;
    Maghrib: string;
    Ishaa: string;
    gregorian: string;
    hijri: string;
};


export const mockPrayerTimes: PrayerTimes = {
    Fadjr: "05:30",
    Shuruk: "07:00",
    Duhr: "13:30",
    Assr: "17:30",
    Maghrib: "20:30",
    Ishaa: "22:00",
    gregorian: "2024-07-28",
    hijri: "1446-01-22"
};

export function getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


/**
 * Parses a "HH:mm" time string into a Date object for the current day.
 * This function runs on the client.
 * @param time The time string to parse.
 * @returns A Date object.
 */
const parseTime = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Determines the current prayer, the next prayer, and the time for the next prayer.
 * This function runs on the client.
 * @param prayerTimes An object containing the prayer times for the day.
 * @returns An object with information about the current and next prayer.
 */
export function getNextPrayerInfo(prayerTimes: PrayerTimes) {
  const now = new Date();
  const prayerSchedule: { name: PrayerName; time: Date }[] = (Object.keys(prayerTimes) as (keyof PrayerTimes)[])
    .filter(name => name !== 'Shuruk' && name !== 'gregorian' && name !== 'hijri') // Shuruk is not a prayer time for this logic
    .map(name => ({
      name: name as PrayerName,
      time: parseTime(prayerTimes[name as PrayerName]),
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  let nextPrayer = prayerSchedule.find(p => p.time > now);
  let currentPrayer = prayerSchedule.slice().reverse().find(p => p.time <= now);

  // If it's after Isha, the next prayer is Fajr of the next day.
  if (!nextPrayer) {
    const fajr = prayerSchedule.find(p => p.name === 'Fadjr');
    if (fajr) {
      nextPrayer = { ...fajr, time: new Date(fajr.time.getTime() + 24 * 60 * 60 * 1000) };
    }
  }

  // If it's before Fajr, the current prayer is Isha of the previous day.
  if (!currentPrayer) {
      const ishaTime = prayerSchedule.find(p => p.name === 'Ishaa')?.time;
      if (ishaTime) {
          currentPrayer = { name: 'Ishaa', time: new Date(ishaTime.getTime() - 24 * 60 * 60 * 1000) };
      }
  }

  // Default to Fajr if no next prayer is found (should not happen with the logic above)
  if (!nextPrayer) {
      const fajr = prayerSchedule.find(p => p.name === 'Fadjr');
      if (fajr) {
         nextPrayer = { ...fajr, time: new Date(fajr.time.getTime() + 24 * 60 * 60 * 1000) };
      } else {
         // Fallback in case Fajr is not in the list
         const fallbackTime = new Date();
         fallbackTime.setDate(fallbackTime.getDate() + 1);
         fallbackTime.setHours(5, 30, 0, 0);
         nextPrayer = { name: 'Fadjr', time: fallbackTime };
      }
  }

  return {
    nextPrayer,
    currentPrayer
  };
}
