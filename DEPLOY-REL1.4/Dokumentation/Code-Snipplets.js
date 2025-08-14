
🔧 Nutze Eruda – ein JS-Plugin mit Konsole im Browserfenster!

Integration (einfach in deiner Seite einbauen):

<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>

🟩 Danach hast du eine kleine Konsole am unteren Bildschirmrand
✅ Läuft auf jedem Handy – keine App nötig
✅ Auch ohne Kabel, ideal für mobile Debug-Zwecke!

🧭 Fazit:
Methode	Plattform	Aufwand	Vorteil
Chrome Remote Debug	Android + PC	Mittel	Vollwertige DevTools
Spezialbrowser	Android / iOS	Einfach	Konsole sofort dabei
Eruda	überall	Minimal	Eingebaute Konsole für Tests

############################################################

✅ Neues Ziel:
Eine professionelle Logging-Funktion, die:

Zeitstempel liefert

Themenbezogene Emojis einsetzt:

INFO 🧭 / 📋

TRIGGER 🔔 / ⏱️

DEBUG 🧪 / 🔍

FEHLER ⚠️ / ❌

const debugMode = true;

const emojiMap = {
  trigger: "🔔",
  info: "📋",
  debug: "🧪",
  error: "⚠️",
  core: "✅" // oder z. B. "🔷" oder "📣"
};

/**
 * Loggt eine Nachricht mit Zeitstempel, Tag und optionaler Emoji-Kategorie
 
  * Erweiterte Logging-Funktion mit Unterstützung für Pflichtmeldungen (type="mandatory")

   Aufruf-Beispiele:
   =================
   Allgemein: logWithTag(tag, message, type);
   tag steht für:
   - functions z.B. "[functionname]"
   - Sektionen z.B. "countdown"
   - Codedatei z.B. "timeUtils"
   type steht für:
          Eines der Elemente aus der emojiMap!

   Konkret:
   logWithTag("[updateHijriDateIfArrived]", `Neues Hijri-Datum: ${hijriElem.textContent.trim()}`, "core"); (recommended) oder
   logWithTag("[updateHijriDateIfArrived]", "Neues Hijri-Datum: " + hijriElem.textContent.trim(), "core");
   
   logWithTag("countdown", "Neue Gebetszeit erkannt", "trigger");
   logWithTag("[highlightActivePrayer]", "Aktive Zelle markiert", "info");
   logWithTag("[deactivateAllActive]", "Aktive Klasse entfernt", "debug");
   logWithTag("timeUtils", "Ungültiges Zeitformat erkannt", "error");
 */
 
function logWithTag(tag = "unknown", message = "", type = "info") {
  const now = new Date();
  const time = now.toTimeString().split(" ")[0];
  const emoji = emojiMap[type] || "";

  // Pflichtmeldung: immer loggen, auch wenn debugMode = false
  if (type === "core") {
    console.log(`${time}${emoji} [${tag}] ${message}`);
    return;
  }

  if (!debugMode) return;
  console.log(`${time}${emoji} [${tag}] ${message}`);
}







