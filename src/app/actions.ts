
'use server';

import type { PrayerTimes, ApiConfig } from "@/lib/prayer-times";

export type YearPrayerTimes = Record<string, Record<string, PrayerTimes>>;

export async function fetchPrayerTimesAPI(date: Date, config: ApiConfig): Promise<YearPrayerTimes> {
  const year = date.getFullYear();

  if (!config || !config.serverUrl || !config.apiKey || !config.alias) {
      throw new Error("API-Konfiguration ist unvollständig. Bitte QR-Code scannen.");
  }
  
  // Stellt sicher, dass die URL mit / endet und der Pfad nicht mit / beginnt
  const baseUrl = config.serverUrl.endsWith('/') ? config.serverUrl : `${config.serverUrl}/`;
  const path = 'api/load_prayer_times.php';
  
  const url = `${baseUrl}${path}?year=${year}`;
  const apiKey = config.apiKey;

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
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(`API-Fehler: Status ${response.status} - ${errorJson.error || errorText}`);
        } catch (e) {
            throw new Error(`API-Fehler: Status ${response.status} - ${errorText}`);
        }
    }

    const data = await response.json();
    
    const yearString = String(year);
    const yearData = data[yearString];

    if (!yearData) {
        throw new Error(`Keine Gebetszeiten für das Jahr ${yearString} gefunden.`);
    }

    return data;

  } catch (error) {
    console.error("Fehler beim Abrufen der Gebetszeiten:", error);
    if (error instanceof Error) {
        // Leite den Originalfehler weiter, insbesondere für den Fall der unvollständigen Konfiguration
        throw error;
    }
    throw new Error("Ein unbekannter Fehler ist aufgetreten.");
  }
}
