
'use server';

import type { PrayerTimes } from "@/lib/prayer-times";

// Funktion zur Formatierung des Datums in YYYY-MM-DD
function getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function fetchPrayerTimesAPI(date: Date): Promise<PrayerTimes> {
  const year = date.getFullYear();
  const apiKey = "9~8tj>dtgirtgW-Z§$%&";
  const url = `https://zero-clue.de/as-salah/api/load_prayer_times.php?year=${year}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
      }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API-Fehler: Status ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Die API liefert ein verschachteltes Objekt. Wir müssen den heutigen Tag finden.
    // z.B. data['2024']['2024-08-07']
    const yearData = data[year];
    if (!yearData) {
        throw new Error(`Keine Gebetszeiten für das Jahr ${year} gefunden.`);
    }

    const todayString = getFormattedDate(date);
    const dailyData = yearData[todayString];

    if (!dailyData) {
        throw new Error(`Keine Gebetszeiten für den ${todayString} gefunden.`);
    }

    // Die API liefert Zeiten mit Sekunden, wir schneiden sie ab.
    const prayerTimes: PrayerTimes = {
      Fadjr: dailyData.Fadjr.substring(0, 5),
      Shuruk: dailyData.Shuruk.substring(0, 5),
      Duhr: dailyData.Duhr.substring(0, 5),
      Assr: dailyData.Assr.substring(0, 5),
      Maghrib: dailyData.Maghrib.substring(0, 5),
      Ishaa: dailyData.Ishaa.substring(0, 5),
    };

    return prayerTimes;

  } catch (error) {
    console.error("Fehler beim Abrufen der Gebetszeiten:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Ein unbekannter Fehler ist aufgetreten.");
  }
}
