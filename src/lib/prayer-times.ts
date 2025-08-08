
export type PrayerName = 'Fadjr' | 'Shuruk' | 'Duhr' | 'Assr' | 'Maghrib' | 'Ishaa';

export interface PrayerTimes {
    Fadjr: string;
    Shuruk: string;
    Duhr: string;
    Assr: string;
    Maghrib: string;
    Ishaa: string;
    Hijri_Date: string;
};

export interface GlobalParameters {
    jumuahTime: string;
    blinkDuration: number;
    activeAus: number;
    assrOneHour: boolean;
    middleNight: boolean;
    offsetFadjr: number;
    offsetDuhr: number;
    offsetAssr: number;
    offsetMaghrib: number;
    offsetIshaa: number;
}

export interface LocalSettings {
    jumuahTime: string;
    prayerOffsets: {
        Fadjr: string;
        Duhr: string;
        Assr: string;
        Maghrib: string;
        Ishaa: string;
    };
    deactivateAssrEarly: boolean;
    deactivateIshaaAtMidnight: boolean;
    // Neu für serverseitige Parameter
    blinkDuration: number;
    activePrayerOffset: number;
}


export interface ApiConfig {
    alias: string;
    serverUrl: string;
    apiKey: string;
}

export interface PrayerTimeOptions {
    deactivateAssrEarly: boolean;
    deactivateIshaaAtMidnight: boolean;
    tomorrowFadjr: string;
    activePrayerOffset: number;
}

export const mockPrayerTimes: PrayerTimes = {
    Fadjr: "05:30",
    Shuruk: "07:00",
    Duhr: "13:30",
    Assr: "17:30",
    Maghrib: "20:30",
    Ishaa: "22:00",
    Hijri_Date: "1446/01/22"
};

export function getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const parseTime = (time: string, date: Date = new Date()): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

const getIslamicMidnight = (maghribTime: Date, fajrTomorrowTime: Date): Date => {
    const nightDuration = fajrTomorrowTime.getTime() - maghribTime.getTime();
    const midnightTime = new Date(maghribTime.getTime() + nightDuration / 2);
    return midnightTime;
};

export function getNextPrayerInfo(
    prayerTimes: PrayerTimes, 
    now: Date,
    options: PrayerTimeOptions
) {
  const prayerSchedule: { name: PrayerName; time: Date }[] = (Object.keys(prayerTimes) as (keyof PrayerTimes)[])
    .filter(name => name !== 'Hijri_Date') 
    .map(name => ({
      name: name as PrayerName,
      time: parseTime(prayerTimes[name as Exclude<keyof PrayerTimes, 'Hijri_Date'>], now),
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const prayersOnly = prayerSchedule.filter(p => p.name !== 'Shuruk');

  let nextPrayer = prayersOnly.find(p => p.time > now);

  if (!nextPrayer) {
    const fajr = prayersOnly.find(p => p.name === 'Fadjr');
    if (fajr) {
      nextPrayer = { ...fajr, time: new Date(fajr.time.getTime() + 24 * 60 * 60 * 1000) };
    } else {
         const fallbackTime = new Date();
         fallbackTime.setDate(fallbackTime.getDate() + 1);
         fallbackTime.setHours(5, 30, 0, 0);
         nextPrayer = { name: 'Fadjr', time: fallbackTime };
    }
  }

  let currentPrayer: { name: PrayerName; time: Date } | undefined = undefined;

  const reversedPrayers = [...prayersOnly].reverse();
  for (const prayer of reversedPrayers) {
      const prayerStartTime = prayer.time;
      if (prayerStartTime > now) continue;

      let prayerEndTime: Date;
      const prayerIndex = prayerSchedule.findIndex(p => p.name === prayer.name);
      
      const activeOffsetMs = options.activePrayerOffset * 60 * 1000;

      switch(prayer.name) {
          case 'Fadjr':
              const shurukTime = prayerSchedule.find(p => p.name === 'Shuruk')?.time;
              prayerEndTime = new Date(shurukTime!.getTime() - activeOffsetMs);
              break;
          
          case 'Assr':
              const maghribTime = prayerSchedule.find(p => p.name === 'Maghrib')?.time;
              if (options.deactivateAssrEarly) {
                  prayerEndTime = new Date(maghribTime!.getTime() - 60 * 60 * 1000);
              } else {
                  prayerEndTime = new Date(maghribTime!.getTime() - activeOffsetMs);
              }
              break;

          case 'Ishaa':
              const tomorrowFajrDate = new Date(now);
              tomorrowFajrDate.setDate(now.getDate() + 1);
              const fajrTomorrowTime = parseTime(options.tomorrowFadjr, tomorrowFajrDate);
              
              if (options.deactivateIshaaAtMidnight) {
                  const maghribTodayTime = prayerSchedule.find(p => p.name === 'Maghrib')?.time;
                  prayerEndTime = getIslamicMidnight(maghribTodayTime!, fajrTomorrowTime);
              } else {
                  prayerEndTime = new Date(fajrTomorrowTime.getTime() - activeOffsetMs);
              }
              break;

          default:
              // Default for Duhr, Maghrib
              const nextPrayerInSchedule = prayerSchedule[prayerIndex + 1];
              if (nextPrayerInSchedule) {
                prayerEndTime = new Date(nextPrayerInSchedule.time.getTime() - activeOffsetMs);
              } else {
                 const tomorrowFajrDateDef = new Date(now);
                 tomorrowFajrDateDef.setDate(now.getDate() + 1);
                 const fajrTomorrowTimeDef = parseTime(options.tomorrowFadjr, tomorrowFajrDateDef);
                 prayerEndTime = new Date(fajrTomorrowTimeDef.getTime() - activeOffsetMs);
              }
              break;
      }
      
      if (now >= prayerStartTime && now < prayerEndTime) {
          currentPrayer = prayer;
          break; 
      }
  }
  
  return {
    nextPrayer,
    currentPrayer
  };
}
