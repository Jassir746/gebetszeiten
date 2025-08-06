import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator";

interface InfoDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function InfoDialog({ isOpen, setIsOpen }: InfoDialogProps) {
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="bg-card/95 backdrop-blur-sm w-[90vw] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-primary text-2xl">Info & Funktionen</SheetTitle>
                    <SheetDescription>
                        Eine Übersicht über die Funktionen dieser App.
                    </SheetDescription>
                </SheetHeader>
                <Separator className="my-4" />
                <div className="prose prose-sm dark:prose-invert text-card-foreground space-y-4 px-2 pb-6">

                    {/* ÄNDERN SIE DEN TEXT HIER */}

                    <h3 className="font-bold text-primary">1. Countdown & Gebetszeiten</h3>
                    <p>
                        Die App zeigt Ihnen die verbleibende Zeit bis zum nächsten Gebet an. Die aktuelle Gebetszeit ist rot hervorgehoben.
                        Die Zeiten werden einmal pro Tag von der API geladen und dann lokal für den schnellen Zugriff gespeichert.
                    </p>
                    
                    <h3 className="font-bold text-primary">2. Datumsanzeige</h3>
                    <p>
                        Die obere Datumsanzeige wechselt automatisch zwischen dem gregorianischen und dem islamischen (Hijri) Datum.
                    </p>

                    <h3 className="font-bold text-primary">3. Einstellungen (Zahnrad-Icon)</h3>
                    <p>
                        Über das Zahnrad-Icon oben rechts können Sie die angezeigten Zeiten anpassen:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Jumuah Zeit:</strong> Hier können Sie die Zeit für das Freitagsgebet manuell einstellen.
                        </li>
                        <li>
                            <strong>Gebets-Offset:</strong> Sie können für jedes Gebet eine individuelle Zeitverschiebung in Minuten eingeben (z.B. &apos;+10&apos; oder &apos;-5&apos;). Dies passt die Gebetszeit an, um sie an die Jama&apos;a-Zeit (Gemeinschaftsgebet) in Ihrer Moschee anzupassen.
                        </li>
                    </ul>

                    <h3 className="font-bold text-primary">4. Datenquelle</h3>
                    <p>
                       Die Gebetszeiten basieren auf den Daten von <a href="https://app.izaachen.de" target="_blank" rel="noopener noreferrer" className="text-primary underline">app.izaachen.de</a>. Ein großer Dank geht an die Betreiber für die Bereitstellung der Daten.
                    </p>

                     {/* ENDE DES EDITIERBAREN BEREICHS */}

                </div>
            </SheetContent>
        </Sheet>
    )
}
