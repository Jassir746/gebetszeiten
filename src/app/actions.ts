
'use server';

import type { PrayerTimes } from "@/lib/prayer-times";

const prayerTimesCache = new Map<number, any>();

async function fetchYearlyPrayerTimes(year: number): Promise<any> {
    if (prayerTimesCache.has(year)) {
        return prayerTimesCache.get(year);
    }

    const API_URL = `https://zero-clue.de/as-salah/api/load_prayer_times.php?year=${year}`;
    const API_KEY = '9~8tj>dtgirtgW-Z§$%&';

    try {
        console.log(`Fetching yearly prayer times for ${year} from API...`);
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API call failed with status: ${response.status}, Body: ${errorText}`);
            // Throw a more specific error
            throw new Error(`API-Antwort ist nicht OK. Status: ${response.status}. Meldung: ${errorText}`);
        }

        const data = await response.json();
        prayerTimesCache.set(year, data);
        return data;

    } catch (error) {
        console.error("Detaillierter Fehler beim Abrufen der Gebetszeiten:", error);
        // Re-throw the caught error to be handled by the client component
        throw new Error("Gebetszeiten konnten nicht vom Server geladen werden");
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
            console.error(`Gebetszeiten für ${dateKey} nicht in der API-Antwort gefunden.`, yearlyData);
            throw new Error(`Gebetszeiten für ${dateKey} nicht gefunden.`);
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
        const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler in fetchPrayerTimesAPI";
        console.error(`Error in fetchPrayerTimesAPI for ${date.toDateString()}:`, errorMessage);
        throw error; // Re-throw to be caught by the UI
    }
}
