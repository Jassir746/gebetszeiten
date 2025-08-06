
'use server';

import type { PrayerTimes } from "@/lib/prayer-times";

export async function fetchPrayerTimesAPI(date: Date): Promise<PrayerTimes> {
  // Die neue, korrekte API-URL
  const baseUrl = 'https://zero-clue.de/as-salah/api/load_prayer_times.php';
  
  // Formatieren des Datums in die benötigten Teile
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Monate sind 0-basiert
  const day = date.getDate();

  // Erstellen der URL mit den richtigen Query-Parametern für einen GET-Request
  const apiUrl = `${baseUrl}?year=${year}&month=${month}&day=${day}`;
  
  try {
    // Die Anfrage wird zu einem GET-Request geändert
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        // Der korrigierte API-Schlüssel
        'X-API-KEY': '9~8tj>dtgirtgW-Z'
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Wir werfen einen neuen Fehler, der die Statusmeldung und den Text enthält
      throw new Error(`API-Fehler: Status ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`API-Fehler: ${data.error}`);
    }

    // Die API-Antwort wird auf unseren PrayerTimes-Typ gemappt
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
    // Wir stellen sicher, dass die Fehlermeldung immer ein String ist
    if (error instanceof Error) {
        throw new Error(`Fehler beim Abrufen der Gebetszeiten: ${error.message}`);
    }
    throw new Error("Ein unbekannter Fehler ist aufgetreten.");
  }
}
