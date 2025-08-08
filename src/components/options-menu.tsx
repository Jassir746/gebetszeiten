
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { LocalSettings } from "@/lib/prayer-times";
import { Lock, Unlock } from "lucide-react";

export type PrayerOffsets = {
    Fadjr: string;
    Duhr: string;
    Assr: string;
    Maghrib: string;
    Ishaa: string;
};

interface OptionsMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    settings: LocalSettings;
    setSettings: (settings: LocalSettings) => void;
    isLocked: boolean;
    setIsLocked: (isLocked: boolean) => void;
}

const prayerOrder: (keyof PrayerOffsets)[] = ['Fadjr', 'Duhr', 'Assr', 'Maghrib', 'Ishaa'];

export function OptionsMenu({ 
    isOpen, 
    setIsOpen, 
    settings,
    setSettings,
    isLocked,
    setIsLocked
}: OptionsMenuProps) {

    const handleOffsetChange = (prayer: keyof PrayerOffsets, value: string) => {
        setSettings({
            ...settings,
            prayerOffsets: {
                ...settings.prayerOffsets,
                [prayer]: value
            }
        });
    };

    const handleJumuahChange = (value: string) => {
        setSettings({ ...settings, jumuahTime: value });
    }

    const handleAssrRuleChange = (value: boolean) => {
        setSettings({ ...settings, deactivateAssrEarly: value });
    }
    
    const handleIshaaRuleChange = (value: boolean) => {
        setSettings({ ...settings, deactivateIshaaAtMidnight: value });
    }

    const disabled = isLocked;
    
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="bg-card/95 backdrop-blur-sm overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-primary">Einstellungen</SheetTitle>
                </SheetHeader>
                
                <Separator className="my-4" />

                <div className="space-y-4 px-2 py-4">

                     <div>
                        <div className="flex items-center justify-between space-x-2 p-2 rounded-lg border bg-primary/10">
                            <Label htmlFor="settings-lock-switch" className="flex flex-col space-y-1">
                                <span className="font-semibold text-primary flex items-center gap-2">
                                    {isLocked ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
                                    Einstellungen gesperrt
                                </span>
                                <span className="font-normal leading-snug text-muted-foreground text-xs">
                                    Globale Werte werden verwendet. Deaktivieren, um Einstellungen lokal zu ändern.
                                </span>
                            </Label>
                            <Switch
                                id="settings-lock-switch"
                                checked={isLocked}
                                onCheckedChange={setIsLocked}
                            />
                        </div>
                    </div>


                    <div>
                        <h4 className="font-bold text-center text-primary mb-3">Jama'a Zeit-Anpassung</h4>
                        <div className="space-y-3 px-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="jumuah-time" className="text-left font-bold col-span-2">Jumuah Zeit</Label>
                                <Input
                                    id="jumuah-time"
                                    type="time"
                                    value={settings.jumuahTime}
                                    onChange={(e) => handleJumuahChange(e.target.value)}
                                    className="col-span-1"
                                    disabled={disabled}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground px-4 -mb-1">
                                Offset für Gemeinschaftsgebet<br/>(in Minuten):
                            </p>
                            {prayerOrder.map((prayer) => (
                                <div key={prayer} className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor={`${prayer}-offset`} className="text-left col-span-2 pl-4">{prayer}</Label>
                                    <Input
                                        id={`${prayer}-offset`}
                                        type="text"
                                        value={settings.prayerOffsets[prayer]}
                                        onChange={(e) => handleOffsetChange(prayer, e.target.value)}
                                        className="col-span-1 text-center"
                                        placeholder="+10"
                                        disabled={disabled}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                        <h4 className="font-bold text-center text-primary mb-3 text-sm">Regeln für die AKTIV-Kennung der Gebetszeiten</h4>
                        <div className="space-y-3 px-4">
                            <div className="flex items-center justify-between space-x-2 p-2 rounded-lg border">
                                <Label htmlFor="assr-makruh-switch" className="flex flex-col space-y-1">
                                    <span className="font-semibold">Assr (Makrūh-Zeit)</span>
                                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                                        Deaktiviert Assr 1 Std. vor Maghrib.
                                    </span>
                                </Label>
                                <Switch
                                    id="assr-makruh-switch"
                                    checked={settings.deactivateAssrEarly}
                                    onCheckedChange={handleAssrRuleChange}
                                    disabled={disabled}
                                />
                            </div>
                             <div className="flex items-center justify-between space-x-2 p-2 rounded-lg border">
                                <Label htmlFor="ishaa-midnight-switch" className="flex flex-col space-y-1">
                                    <span className="font-semibold">Ishaa (Mitte der Nacht)</span>
                                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                                        Deaktiviert Ishaa zur<br/>islam. Mitte der Nacht.
                                    </span>
                                </Label>
                                <Switch
                                    id="ishaa-midnight-switch"
                                    checked={settings.deactivateIshaaAtMidnight}
                                    onCheckedChange={handleIshaaRuleChange}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="px-2 pt-6">
                    <Button onClick={() => setIsOpen(false)} className="w-full">Speichern & Schließen</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
