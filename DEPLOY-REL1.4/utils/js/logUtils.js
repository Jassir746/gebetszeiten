const debugMode = false;

const emojiMap = {
  trigger: "🔔",
  info:    "📋",
  debug:   "🧪",
  error:   "⚠️",
  core:    "✅" // oder z.B. "🔷" oder "📣"
};

/**
 * Loggt eine Nachricht mit Zeitstempel, Tag und optionaler Emoji-Kategorie
 
  * Erweiterte Logging-Funktion mit Unterstützung für Pflichtmeldungen (type="mandatory")

   Aufruf-Beispiele:
   =================
   Allgemein: logWithTag(tag="unknown", message, type, data=null);
   tag steht für:
   - functions z.B. "[functionname]"
   - Sektionen z.B. "countdown"
   - Codedatei z.B. "timeUtils"
   type steht für:
          Eines der Elemente aus der emojiMap!

   Konkret:
   logWithTag("updateHijriDateIfArrived", `Neues Hijri-Datum: ${hijriElem.textContent.trim()}`, "core"); (recommended) oder
   logWithTag("updateHijriDateIfArrived", "Neues Hijri-Datum: " + hijriElem.textContent.trim(), "core");
   
   logWithTag("countdown", "Neue Gebetszeit erkannt", "trigger");
   logWithTag("highlightActivePrayer", "Aktive Zelle markiert", "info");
   logWithTag("deactivateAllActive", "Aktive Klasse entfernt", "debug");
   logWithTag("timeUtils", "Ungültiges Zeitformat erkannt", "error");
   
   // NEU: 4.Parameter für die Übergabe von Datenobjekten  
   logWithTag("Page RELOAD", "Gebetszeiten: ", "info", prayerTimes);
 */
 
function logWithTag(tag="unknown", message = "", type = "info", data=null) {
  const now = new Date();
  const time = now.toTimeString().split(" ")[0];
  const emoji = emojiMap[type] || "";

  const logHeader = `${time} ${emoji} [${tag}] ${message}`;

  if (type === "core") {
    data ? console.log(logHeader, data) : console.log(logHeader);
    return;
  }

  if (!debugMode) return;
  data ? console.log(logHeader, data) : console.log(logHeader);
}
