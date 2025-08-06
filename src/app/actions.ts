'use server';

import type { PrayerTimes } from "@/lib/prayer-times";

// This is a cache for the prayer times to avoid fetching the same year multiple times.
const prayerTimesCache = new Map<number, any>();

async function fetchYearlyPrayerTimes(year: number): Promise<any> {
    if (prayerTimesCache.has(year)) {
        return prayerTimesCache.get(year);
    }

    const API_URL = `https://zero-clue.de/as-salah/api/load_prayer_times.php?year=${year}`;
    const API_KEY = '9~8tj>dtgirtgW-Z§$%&';

    try {
        console.log(`Fetching yearly prayer times for ${year} from API...`);
        // Using the standard 'Authorization' header with Bearer token is more robust.
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            next: { revalidate: 60 * 60 * 24 } // Revalidate once a day
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API call failed. Status: ${response.status}, Body: ${errorText}`);
            throw new Error(`API call failed with status: ${response.status}.`);
        }

        const data = await response.json();
        prayerTimesCache.set(year, data);
        return data;

    } catch (error) {
        console.error(`Failed to fetch or process yearly prayer times for ${year}:`, error);
        throw new Error("Could not fetch prayer times from the server.");
    }
}

export async function fetchPrayerTimesAPI(date: Date): Promise<PrayerTimes> {
    try {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const yearlyData = await fetchYearlyPrayerTimes(year);

        const yearData = yearlyData[String(year)];
        const dayTimes = yearData?.[dateKey];

        if (!dayTimes) {
            throw new Error(`Prayer times not found for ${dateKey} in API response.`);
        }

        return {
            Fadjr: dayTimes.Fadjr.slice(0, 5),
            Shuruk: dayTimes.Shuruk.slice(0, 5),
            Duhr: dayTimes.Duhr.slice(0, 5),
            Assr: dayTimes.Assr.slice(0, 5),
            Maghrib: dayTimes.Maghrib.slice(0, 5),
            Ishaa: dayTimes.Ishaa.slice(0, 5),
        };
    } catch (error) {
        console.error(`Error in fetchPrayerTimesAPI for ${date.toDateString()}:`, error);
        // This re-throws the error to be caught by the client component.
        throw error;
    }
}
