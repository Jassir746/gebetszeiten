
'use server';

import type { PrayerTimes, ApiConfig, GlobalParameters } from "@/lib/prayer-times";

export type YearPrayerTimes = Record<string, Record<string, PrayerTimes>>;

export async function fetchPrayerTimesAPI(date: Date, config: ApiConfig): Promise<YearPrayerTimes> {
  const year = date.getFullYear();

  if (!config || !config.serverUrl || !config.apiKey || !config.alias) {
      throw new Error("API-Konfiguration ist unvollständig. Bitte QR-Code scannen.");
  }
  
  const baseUrl = config.serverUrl.endsWith('/') ? config.serverUrl : `${config.serverUrl}/`;
  const path = 'api/load_prayer_times.php';
  
  const url = `${baseUrl}${path}?year=${year}`;
  const apiKey = config.apiKey;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json',
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
        throw error;
    }
    throw new Error("Ein unbekannter Fehler ist aufgetreten.");
  }
}


export async function fetchGlobalParametersAPI(config: ApiConfig): Promise<GlobalParameters> {
    if (!config || !config.serverUrl || !config.apiKey) {
      throw new Error("API-Konfiguration ist unvollständig für Parameter-Abruf.");
    }

    const baseUrl = config.serverUrl.endsWith('/') ? config.serverUrl : `${config.serverUrl}/`;
    const path = 'utils/load_parameters.php';
    const url = `${baseUrl}${path}`;
    const apiKey = config.apiKey;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': apiKey,
                'Accept': 'application/json',
                'User-Agent': 'Firebase-Studio-Client'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Parameter API Fehler: Status ${response.status} - ${errorText}`);
        }
        
        // Ensure the response is properly handled as JSON
        const data: GlobalParameters = await response.json();
        return data;

    } catch (error) {
        console.error("Fehler beim Abrufen der globalen Parameter:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Ein unbekannter Fehler beim Abrufen der Parameter ist aufgetreten.");
    }
}
