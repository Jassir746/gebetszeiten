
export type PrayerName = 'Fadjr' | 'Shuruk' | 'Duhr' | 'Assr' | 'Maghrib' | 'Ishaa';

export type PrayerTimes = Record<PrayerName, string>;

interface DailyPrayerTimes {
    [date: string]: PrayerTimes;
}

interface YearlyPrayerTimes {
  [year: string]: DailyPrayerTimes;
}

// Cache for yearly prayer times to avoid repeated API calls within the same session.
let yearlyDataCache: { year: number | null, data: DailyPrayerTimes | null } = { year: null, data: null };


/**
 * Fetches prayer times for a whole year from the API.
 * @param year The year for which to fetch prayer times.
 * @returns A promise that resolves with the prayer times for the entire year.
 */
async function fetchYearlyPrayerTimes(year: number): Promise<DailyPrayerTimes> {
  // Return from cache if available for the same year
  if (yearlyDataCache.year === year && yearlyDataCache.data) {
    return yearlyDataCache.data;
  }

  const API_URL = `https://zero-clue.de/as-salah/api/load_prayer_times.php?year=${year}`;
  const API_KEY = '9~8tj>dtgirtgW-Z§$%&';

  console.log(`Fetching yearly prayer times for ${year} from API...`);

  try {
    const response = await fetch(API_URL, {
      headers: {
        'X-API-KEY': API_KEY,
      },
      // This setting helps to mitigate potential CORS issues when fetching from the server side.
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed with status: ${response.status}. Details: ${errorText}`);
    }

    const data: YearlyPrayerTimes = await response.json();
    const yearData = data[year];

    if (!yearData) {
        throw new Error(`Year ${year} not found in API response.`);
    }

    // Store in cache
    yearlyDataCache = { year, data: yearData };

    console.log(`Successfully fetched and cached prayer times for ${year}.`);
    return yearData;

  } catch (error) {
    console.error("Failed to fetch yearly prayer times:", error);
    throw new Error("Could not fetch prayer times from the server.");
  }
}


/**
 * Gets prayer times for a specific date by fetching the whole year if not already cached.
 * @param date The date for which to get prayer times.
 * @param latitude The user's latitude (no longer needed for API call but kept for interface consistency).
 * @param longitude The user's longitude (no longer needed for API call but kept for interface consistency).
 * @returns A promise that resolves with the prayer times for the given date.
 */
export async function getPrayerTimes(date: Date, latitude: number, longitude: number): Promise<PrayerTimes> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // '01', '02', ..., '12'
  const day = String(date.getDate()).padStart(2, '0'); // '01', '02', ...
  const dateKey = `${year}-${month}-${day}`;

  try {
    const yearlyTimes = await fetchYearlyPrayerTimes(year);
    const dayTimes = yearlyTimes[dateKey];

    if (!dayTimes) {
      throw new Error(`Prayer times not found for ${dateKey}`);
    }

    // The API provides Fadjr, Shuruk, Duhr, Assr, Maghrib, Ishaa
    // and times might have seconds, so we trim them.
    return {
      Fadjr: dayTimes.Fadjr.slice(0, 5),
      Shuruk: dayTimes.Shuruk.slice(0, 5),
      Duhr: dayTimes.Duhr.slice(0, 5),
      Assr: dayTimes.Assr.slice(0, 5),
      Maghrib: dayTimes.Maghrib.slice(0, 5),
      Ishaa: dayTimes.Ishaa.slice(0, 5),
    };

  } catch (error) {
    console.error(`Error getting prayer times for ${date.toDateString()}:`, error);
    // Fallback to mock data in case of error
    console.warn("API fetch failed. Using mock data as a fallback.");
    return {
      Fadjr: '05:30',
      Shuruk: '07:00',
      Duhr: '13:30',
      Assr: '17:30',
      Maghrib: '20:30',
      Ishaa: '22:00',
    };
  }
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
    .filter(name => name !== 'Shuruk') // Shuruk is not a prayer time for this logic
    .map(name => ({
      name,
      time: parseTime(prayerTimes[name]),
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
