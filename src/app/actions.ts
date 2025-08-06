
'use server';

import type { PrayerTimes } from "@/lib/prayer-times";

export type YearPrayerTimes = Record<string, Record<string, PrayerTimes>>;

// Funktion zur Formatierung des Datums in YYYY-MM-DD
function getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function fetchPrayerTimesAPI(date: Date): Promise<YearPrayerTimes> {
  const year = date.getFullYear();
  // Angepasst an den exakten Wert aus dem funktionierenden curl-Befehl, um Kodierungsprobleme zu lösen
  const apiKey = "9~8tj>dtgirtgW-ZÂ§$%&";
  const url = `https://zero-clue.de/as-salah/api/load_prayer_times.php?year=${year}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Accept': '*/*',
        'User-Agent': 'Firebase-Studio-Client'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
        const errorText = await response.text();
        // Wir versuchen, die JSON-Fehlermeldung zu parsen, falls vorhanden
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(`API-Fehler: Status ${response.status} - ${errorJson.error || errorText}`);
        } catch (e) {
            throw new Error(`API-Fehler: Status ${response.status} - ${errorText}`);
        }
    }

    const data = await response.json();
    
    // Die API liefert ein verschachteltes Objekt. Wir prüfen, ob das Jahr da ist.
    const yearString = String(year);
    const yearData = data[yearString];

    if (!yearData) {
        throw new Error(`Keine Gebetszeiten für das Jahr ${yearString} gefunden.`);
    }

    // Wir geben das gesamte Jahresobjekt zurück
    return data;

  } catch (error) {
    console.error("Fehler beim Abrufen der Gebetszeiten:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Ein unbekannter Fehler ist aufgetreten.");
  }
}
