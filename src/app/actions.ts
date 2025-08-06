'use server';

// This file is intentionally left with minimal code after reverting changes.
// The API call logic has been removed to restore the application's UI.

import type { PrayerTimes } from "@/lib/prayer-times";

export async function fetchPrayerTimesAPI(date: Date): Promise<PrayerTimes> {
  console.log("API call has been disabled to restore UI. Returning placeholder data.");
  // Returning a dummy structure to satisfy the type system.
  // This function should not be called by the restored UI.
  return {
    Fadjr: '00:00',
    Shuruk: '00:00',
    Duhr: '00:00',
    Assr: '00:00',
    Maghrib: '00:00',
    Ishaa: '00:00',
  };
}
