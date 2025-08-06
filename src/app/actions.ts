
'use server';

import type { PrayerTimes } from "@/lib/prayer-times";
import { mockPrayerTimes } from "@/lib/prayer-times";

export async function fetchPrayerTimesAPI(date: Date): Promise<PrayerTimes> {
  // Simuliert eine Netzwerkverzögerung
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log("Fetching mock prayer times for date:", date.toISOString().split('T')[0]);

  // Gibt die Mock-Daten zurück
  return mockPrayerTimes;
}
