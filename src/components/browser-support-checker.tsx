'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const BrowserSupportChecker = ({ children }: { children: React.ReactNode }) => {
  const [isSupported, setIsSupported] = useState(true);

  // We set the initial state to false on the server and check on the client.
  // This prevents a flash of unsupported content on the server render.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        // Simple checks for modern features essential for the app.
        if (
            typeof Promise === 'undefined' || 
            typeof window.localStorage === 'undefined' || 
            typeof window.fetch === 'undefined'
        ) {
            setIsSupported(false);
        } else {
            setIsSupported(true);
        }
    }
  }, []);

  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatches
    // and to prevent showing the app to an unsupported browser initially.
    return null;
  }

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8 text-center">
        <div className="max-w-md p-8 rounded-lg bg-card border-2 border-destructive shadow-2xl shadow-destructive/20">
            <div className="flex flex-col items-center text-destructive mb-6">
                <AlertTriangle className="w-16 h-16" />
                <h1 className="text-2xl font-bold mt-4">Browser nicht unterstützt</h1>
            </div>
            <p className="text-card-foreground">
            Für eine optimale Funktion benötigt diese Anwendung einen modernen Web-Browser.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
            Bitte aktualisieren Sie Ihren Browser oder installieren Sie eine aktuelle Version von Chrome, Firefox, Edge oder Safari.
            </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export { BrowserSupportChecker };
