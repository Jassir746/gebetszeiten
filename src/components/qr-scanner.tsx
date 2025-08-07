
'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CameraOff } from 'lucide-react';

interface QrScannerDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onScanSuccess: (decodedText: string) => void;
}

const QR_REGION_ID = "qr-reader-region";

export function QrScannerDialog({ isOpen, setIsOpen, onScanSuccess }: QrScannerDialogProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [hasPermission, setHasPermission] = useState(true);

    useEffect(() => {
        if (isOpen) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const startScanner = async () => {
        try {
            // Ensure the element is in the DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            const qrScanner = new Html5Qrcode(QR_REGION_ID);
            scannerRef.current = qrScanner;

            // Check for camera permissions
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) {
                setHasPermission(false);
                throw new Error("No cameras found");
            }
            
            setHasPermission(true);

            await qrScanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    onScanSuccess(decodedText);
                    setIsOpen(false); // Close dialog on success
                },
                (errorMessage) => {
                    // console.log("QR Scan error:", errorMessage);
                }
            );

        } catch (err) {
            console.error("Error starting QR scanner:", err);
            setHasPermission(false);
            if (scannerRef.current?.isScanning) {
                 await scannerRef.current.stop();
            }
        }
    };

    const stopScanner = () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(err => {
                console.error("Failed to stop scanner cleanly", err);
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="bg-card/95 backdrop-blur-sm w-[90vw] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle className="text-primary text-2xl">QR-Code scannen</SheetTitle>
                    <SheetDescription>
                        Richten Sie die Kamera auf den QR-Code Ihrer Gemeinde.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 aspect-square w-full rounded-lg bg-slate-900 overflow-hidden" id={QR_REGION_ID}>
                    {!hasPermission && (
                         <div className="flex flex-col items-center justify-center h-full text-white p-4">
                            <CameraOff className="w-16 h-16 text-red-500 mb-4" />
                            <Alert variant="destructive" className='bg-destructive/20 border-destructive/50'>
                                <AlertTitle>Kamerazugriff erforderlich</AlertTitle>
                                <AlertDescription>
                                    Bitte erlauben Sie den Zugriff auf die Kamera in den Browser-Einstellungen, um den QR-Code zu scannen.
                                </AlertDescription>
                            </Alert>
                         </div>
                    )}
                </div>
                 <div className="text-center text-xs text-muted-foreground mt-4">
                    Die Kamera wird nur für den Scanvorgang aktiviert.
                </div>
            </SheetContent>
        </Sheet>
    );
}
