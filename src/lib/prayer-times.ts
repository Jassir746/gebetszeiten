export type PrayerName = 'Fadjr' | 'Shuruk' | 'Duhr' | 'Assr' | 'Maghrib' | 'Ishaa';

export type PrayerTimes = Record<PrayerName, string>;

// Hardcoded data for demonstration. In a real application, this would come from an API.
const MOCK_PRAYER_TIMES: PrayerTimes = {
  Fadjr: '04:33',
  Shuruk: '06:01',
  Duhr: '12:48',
  Assr: '16:29',
  Maghrib: '19:35',
  Ishaa: '21:03',
};

/**
 * Simulates fetching prayer times from an API.
 * @param date The date for which to fetch prayer times.
 * @param latitude The user's latitude.
 * @param longitude The user's longitude.
 * @returns A promise that resolves with the prayer times.
 */
export async function getPrayerTimes(date: Date, latitude: number, longitude: number): Promise<PrayerTimes> {
  console.log(`Fetching prayer times for ${date.toDateString()} at lat: ${latitude}, long: ${longitude}`);
  // In a real app, you would use these parameters to call a prayer times API.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_PRAYER_TIMES);
    }, 1000);
  });
}

/**
 * Parses a "HH:mm" time string into a Date object for the current day.
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
 * @param prayerTimes An object containing the prayer times for the day.
 * @returns An object with information about the current and next prayer.
 */
export function getNextPrayerInfo(prayerTimes: PrayerTimes) {
  const now = new Date();
  const prayerSchedule: { name: PrayerName; time: Date }[] = (Object.keys(prayerTimes) as PrayerName[])
    .map(name => ({
      name,
      time: parseTime(prayerTimes[name]),
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  let nextPrayer = prayerSchedule.find(p => p.time > now);
  let currentPrayer = prayerSchedule.slice().reverse().find(p => p.time <= now);

  // If it's after Isha, the next prayer is Fajr of the next day.
  if (!nextPrayer) {
    const fajr = prayerSchedule[0];
    nextPrayer = { ...fajr, time: new Date(fajr.time.getTime() + 24 * 60 * 60 * 1000) };
  }

  // If it's before Fajr, the current prayer is Isha of the previous day.
  if (!currentPrayer) {
      const ishaTime = prayerSchedule.find(p => p.name === 'Ishaa')?.time;
      if (ishaTime) {
          currentPrayer = { name: 'Ishaa', time: new Date(ishaTime.getTime() - 24 * 60 * 60 * 1000) };
      }
  }

  return {
    nextPrayer,
    currentPrayer
  };
}
