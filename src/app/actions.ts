
'use server';

import type { PrayerTimes } from "@/lib/prayer-times";

export async function fetchPrayerTimesAPI(date: Date): Promise<PrayerTimes> {
  const baseUrl = 'https://zero-clue.de/as-salah/api/load_prayer_times.php';
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const apiUrl = `${baseUrl}?year=${year}&month=${month}&day=${day}`;
  
  try {
    const headers = new Headers();
    headers.append('X-API-KEY', '9~8tj>dtgirtgW-Z§$%&');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API-Fehler: Status ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`API-Fehler: ${data.error}`);
    }
    
    const prayerTimes: PrayerTimes = {
        Fadjr: data.Fajr,
        Shuruk: data.Sunrise,
        Duhr: data.Dhuhr,
        Assr: data.Asr,
        Maghrib: data.Maghrib,
        Ishaa: data.Isha,
    };

    return prayerTimes;

  } catch (error) {
    console.error("Fehler beim Abrufen der Gebetszeiten:", error);
    if (error instanceof Error) {
        throw new Error(`Fehler beim Abrufen der Gebetszeiten: ${error.message}`);
    }
    throw new Error("Ein unbekannter Fehler ist aufgetreten.");
  }
}
