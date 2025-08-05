import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";

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
    jumuahTime: string;
    setJumuahTime: (time: string) => void;
    prayerOffsets: PrayerOffsets;
    setPrayerOffsets: (offsets: PrayerOffsets) => void;
}

const prayerOrder: (keyof PrayerOffsets)[] = ['Fadjr', 'Duhr', 'Assr', 'Maghrib', 'Ishaa'];

export function OptionsMenu({ isOpen, setIsOpen, jumuahTime, setJumuahTime, prayerOffsets, setPrayerOffsets }: OptionsMenuProps) {

    const handleOffsetChange = (prayer: keyof PrayerOffsets, value: string) => {
        setPrayerOffsets({
            ...prayerOffsets,
            [prayer]: value
        });
    };
    
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="bg-card/95 backdrop-blur-sm">
                <SheetHeader>
                    <SheetTitle className="text-primary">Einstellungen</SheetTitle>
                    <SheetDescription>
                        Passen Sie hier die Gebetszeiten und andere Optionen an.
                    </SheetDescription>
                </SheetHeader>
                <Separator className="my-4" />
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="jumuah-time" className="text-left font-bold col-span-2">Jumuah Zeit</Label>
                        <Input
                            id="jumuah-time"
                            type="time"
                            value={jumuahTime}
                            onChange={(e) => setJumuahTime(e.target.value)}
                            className="col-span-1"
                        />
                    </div>
                    <Separator />
                    <h4 className="font-bold text-center text-primary">Gebets-Offsets (in Minuten)</h4>
                     {prayerOrder.map((prayer) => (
                        <div key={prayer} className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor={`${prayer}-offset`} className="text-left col-span-2">{prayer}</Label>
                            <Input
                                id={`${prayer}-offset`}
                                type="text"
                                value={prayerOffsets[prayer]}
                                onChange={(e) => handleOffsetChange(prayer, e.target.value)}
                                className="col-span-1 text-center"
                            />
                        </div>
                    ))}
                </div>
                <SheetFooter>
                    <Button onClick={() => setIsOpen(false)}>Speichern & Schließen</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
