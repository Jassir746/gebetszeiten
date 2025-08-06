'use server';

import type { PrayerTimes } from "@/lib/prayer-times";

export async function fetchPrayerTimesAPI(date: Date): Promise<PrayerTimes> {
  const timezone = 'Europe/Berlin';
  const dateString = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: timezone }).format(date);

  try {
    const response = await fetch('https://app.izaachen.de/prayer_times_beta.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-KEY': '9~8tj>dtgirtgW-Z§$%&'
      },
      body: new URLSearchParams({
        date: dateString,
        timezone: timezone,
        method: '12'
      }),
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

    // Map API response to our PrayerTimes type
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
