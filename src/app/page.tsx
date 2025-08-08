
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PrayerTimes, PrayerName, getNextPrayerInfo, getFormattedDate, ApiConfig, GlobalParameters, LocalSettings } from '@/lib/prayer-times';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { OptionsMenu } from '@/components/options-menu';
import { InfoDialog } from '@/components/info-dialog';
import { fetchPrayerTimesAPI, YearPrayerTimes, fetchGlobalParametersAPI } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, QrCode } from 'lucide-react';
import { QrScannerDialog } from '@/components/qr-scanner';
import useLocalStorage from '@/hooks/use-local-storage';
import { decryptData } from '@/lib/crypto';
import { cn } from '@/lib/utils';

interface PrayerInfo {
    nextPrayer: { name: PrayerName; time: Date };
    currentPrayer?: { name: PrayerName; time: Date };
}

const PRAYER_TIMES_STORAGE_KEY = 'prayerTimesData';
const SETTINGS_STORAGE_KEY = 'prayerAppSettings';
const API_CONFIG_STORAGE_KEY = 'prayerApiConfig';

const defaultConfig: ApiConfig = {
    alias: "Dortmund-1",
    serverUrl: "https://zero-clue.de/as-salah/",
    apiKey: "9~8tj>dtgirtgW-ZÂ§$%&"
};

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [tomorrowPrayerTimes, setTomorrowPrayerTimes] = useState<PrayerTimes | null>(null);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [date] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const { toast } = useToast();
  
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [apiConfig, setApiConfig] = useLocalStorage<ApiConfig>(API_CONFIG_STORAGE_KEY, defaultConfig);

  // Global settings fetched from API
  const [globalSettings, setGlobalSettings] = useState<GlobalParameters | null>(null);

  // Local settings with overrides
  const [localSettings, setLocalSettings] = useLocalStorage<LocalSettings>(`${SETTINGS_STORAGE_KEY}:${apiConfig.alias}`, {
    jumuahTime: '14:00',
    prayerOffsets: { Fadjr: '+30', Duhr: '+10', Assr: '+10', Maghrib: '+5', Ishaa: '+10' },
    deactivateAssrEarly: true,
    deactivateIshaaAtMidnight: true,
    blinkDuration: 2,
    activePrayerOffset: 10,
  });
  
  const [settingsLocked, setSettingsLocked] = useLocalStorage<boolean>(`${SETTINGS_STORAGE_KEY}:${apiConfig.alias}:locked`, true);

  const updateLocalSettingsFromGlobal = useCallback((global: GlobalParameters) => {
       setLocalSettings(prev => ({
            ...prev,
            jumuahTime: global.jumuahTime,
            prayerOffsets: {
                Fadjr: String(global.offsetFadjr),
                Duhr: String(global.offsetDuhr),
                Assr: String(global.offsetAssr),
                Maghrib: String(global.offsetMaghrib),
                Ishaa: String(global.offsetIshaa),
            },
            deactivateAssrEarly: global.assrOneHour,
            deactivateIshaaAtMidnight: global.middleNight,
            blinkDuration: global.blinkDuration,
            activePrayerOffset: global.activeAus,
        }));
  }, [setLocalSettings]);


  const fetchAndSetData = useCallback(async (forceApiFetch = false) => {
    if (!apiConfig || !apiConfig.serverUrl || !apiConfig.apiKey) {
        setError("Bitte scannen Sie den QR-Code, um die App zu konfigurieren.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    let loadedFromStorage = false;

    // --- Step 1: Fetch Global Parameters ---
    try {
        const fetchedGlobalSettings = await fetchGlobalParametersAPI(apiConfig);
        setGlobalSettings(fetchedGlobalSettings);

        if (settingsLocked) {
             updateLocalSettingsFromGlobal(fetchedGlobalSettings);
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Globale Parameter konnten nicht geladen werden.";
        setError(errorMessage);
        toast({ variant: "destructive", title: "Fehler bei Parametern", description: errorMessage });
    }


    // --- Step 2: Load Prayer Times (from cache or API) ---
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const year = today.getFullYear().toString();
    const todayFormatted = getFormattedDate(today);
    const tomorrowFormatted = getFormattedDate(tomorrow);

    try {
      const storedData = localStorage.getItem(`${PRAYER_TIMES_STORAGE_KEY}:${apiConfig.alias}`);
      if (storedData && !forceApiFetch) {
        const parsedData: YearPrayerTimes = JSON.parse(storedData);
        const yearData = parsedData[year];
        if (yearData && yearData[todayFormatted]) {
          setPrayerTimes(yearData[todayFormatted]);
          if (yearData[tomorrowFormatted]) setTomorrowPrayerTimes(yearData[tomorrowFormatted]);
          loadedFromStorage = true;
        }
      }
    } catch (e) { console.error("Failed to read from localStorage", e); }
    
    try {
      let yearlyData = await fetchPrayerTimesAPI(today, apiConfig);
      
      if (today.getMonth() === 11 && today.getDate() === 31) {
          const nextYearData = await fetchPrayerTimesAPI(tomorrow, apiConfig);
          yearlyData = {...yearlyData, ...nextYearData};
      }

      localStorage.setItem(`${PRAYER_TIMES_STORAGE_KEY}:${apiConfig.alias}`, JSON.stringify(yearlyData));

      const todayYearData = yearlyData[year];
      const tomorrowYear = tomorrow.getFullYear().toString();
      const tomorrowYearData = yearlyData[tomorrowYear];

      if (todayYearData && todayYearData[todayFormatted]) {
         setPrayerTimes(todayYearData[todayFormatted]);
      } else {
          throw new Error(`Keine Gebetszeiten für heute (${todayFormatted}) in den API-Daten gefunden.`);
      }
      
      if (tomorrowYearData && tomorrowYearData[tomorrowFormatted]) {
          setTomorrowPrayerTimes(tomorrowYearData[tomorrowFormatted]);
      } else {
           if (!loadedFromStorage) {
              console.warn(`Keine morgigen Gebetszeiten (${tomorrowFormatted}) gefunden.`);
           }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.";
      if (!loadedFromStorage) {
          setError(prevError => prevError ? `${prevError}\n${errorMessage}` : errorMessage);
          toast({ variant: "destructive", title: "Fehler beim Laden", description: errorMessage });
      }
      console.error("API Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [apiConfig, settingsLocked, toast, updateLocalSettingsFromGlobal]);

  const handleRestoreDefaults = useCallback(async () => {
    if (!apiConfig) return;
    try {
        const fetchedGlobalSettings = await fetchGlobalParametersAPI(apiConfig);
        updateLocalSettingsFromGlobal(fetchedGlobalSettings);
        toast({ title: "Erfolg", description: "Die globalen Einstellungen wurden wiederhergestellt." });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Standardeinstellungen konnten nicht geladen werden.";
        toast({ variant: "destructive", title: "Fehler", description: errorMessage });
    }
  }, [apiConfig, updateLocalSettingsFromGlobal, toast]);


  useEffect(() => {
    fetchAndSetData();
  }, [apiConfig, fetchAndSetData]);
  

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerTimes) {
        const currentPrayerInfo = getNextPrayerInfo(
            prayerTimes,
            now,
            {
              deactivateAssrEarly: localSettings.deactivateAssrEarly,
              deactivateIshaaAtMidnight: localSettings.deactivateIshaaAtMidnight,
              tomorrowFadjr: tomorrowPrayerTimes?.Fadjr ?? '05:30',
              activePrayerOffset: localSettings.activePrayerOffset,
            }
        );
        setPrayerInfo(currentPrayerInfo);
    }
  }, [prayerTimes, tomorrowPrayerTimes, localSettings, now]);


  const renderContent = () => {
    if (loading && !prayerTimes) {
      return (
        <div className="w-full max-w-[18.5rem] mx-auto">
          <Skeleton className="h-[600px] w-full rounded-xl bg-primary/10" />
        </div>
      );
    }

    if (error && !prayerTimes) {
       return (
         <div className="w-full max-w-[18.5rem] mx-auto">
             <Card 
                className="w-full shadow-2xl shadow-destructive/20 border-destructive/50 bg-card/70"
            >
               <CardHeader className="text-center pb-4">
                 <div className="flex flex-col items-center text-destructive">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <CardTitle className="text-lg">Fehler</CardTitle>
                 </div>
               </CardHeader>
               <CardContent className="text-center">
                 <p className="whitespace-pre-wrap">{error}</p>
                 <button onClick={() => setIsScannerOpen(true)} className="mt-4 inline-flex items-center gap-2 text-primary underline">
                    <QrCode className="w-4 h-4" /> QR-Code scannen
                 </button>
               </CardContent>
             </Card>
         </div>
       );
    }
    
    if (prayerTimes && prayerInfo) {
      return (
        <div className="w-full max-w-[18.5rem] mx-auto">
          <PrayerTimesCard
            prayerTimes={prayerTimes}
            nextPrayer={prayerInfo.nextPrayer}
            currentPrayer={prayerInfo.currentPrayer}
            gregorianDate={getFormattedDate(date)}
            now={now}
            jumuahTime={localSettings.jumuahTime}
            prayerOffsets={localSettings.prayerOffsets}
            blinkDuration={localSettings.blinkDuration}
            setIsOptionsOpen={setIsOptionsOpen}
            setIsInfoOpen={setIsInfoOpen}
            setIsScannerOpen={setIsScannerOpen}
            locationName={apiConfig?.alias || "Standort"}
            footer={
                <div className="flex flex-col items-end mt-4">
                    <a href="https://app.izaachen.de" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-black text-sm hover:text-accent transition-colors underline">
                        <span className="text-lg">☪</span>
                        app.izaachen.de
                    </a>
                    <p className="text-xs text-black font-bold text-right w-full mt-1">
                        {apiConfig?.alias || "Standort"}
                    </p>
                </div>
            }
          />
        </div>
      );
    }

    return null; 
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-transparent px-8 py-6 font-body">
       <OptionsMenu
          isOpen={isOptionsOpen}
          setIsOpen={setIsOptionsOpen}
          settings={localSettings}
          setSettings={setLocalSettings}
          isLocked={settingsLocked}
          setIsLocked={setSettingsLocked}
          onRestoreDefaults={handleRestoreDefaults}
      />
      <InfoDialog isOpen={isInfoOpen} setIsOpen={setIsInfoOpen} />
      <QrScannerDialog 
        isOpen={isScannerOpen} 
        setIsOpen={setIsScannerOpen}
        onScanSuccess={(data) => {
            try {
                const decryptedText = decryptData(data);
                const newConfig: ApiConfig = JSON.parse(decryptedText);

                if(newConfig.alias && newConfig.serverUrl && newConfig.apiKey) {
                    setApiConfig(newConfig);
                    toast({ title: "Erfolg", description: `Konfiguration für ${newConfig.alias} geladen.`});
                } else {
                    throw new Error("Ungültiges Datenformat in QR-Code.");
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "Unbekannter Fehler.";
                toast({ 
                    variant: "destructive", 
                    title: "Scan-Fehler", 
                    description: `Entschlüsselung oder Parsing fehlgeschlagen: ${message}` 
                });
            }
        }}
      />
      {renderContent()}
    </main>
  );
}
