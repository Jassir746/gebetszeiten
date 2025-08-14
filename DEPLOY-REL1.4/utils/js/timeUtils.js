// -----------------------------------------------------------------
//---  Funktion getDateFromTimeString
//---
//---   INPUT: TimeString z.B.: "13:30"
//---  OUTPUT: Date-Objekt (h, m, 0, 0)
//---
//---  Aufrufbeispiel: const prayerTime = getDateFromTimeString(time);
//---
// === function getDateFromTimeString(timeStr, baseDate = new Date())
function getDateFromTimeString(timeStr, baseDate = new Date()) {
    const [h, m] = timeStr.split(":").map(Number);
    const date = new Date(baseDate);
    date.setHours(h, m, 0, 0);
    return date;
}

// -----------------------------------------------------------------------------
//---  Funktion getIslamicMidnight
//---  Berechnet die islamische Mitternacht als arithmetisches Mittel von Maghrib und Fadjr
//---  Beispiel: getIslamicMidnight(maghribDate, fajrDate) → Date-Objekt der Mitternacht
function getIslamicMidnight(maghribTime, fajrTime) {
  const midpoint = new Date((maghribTime.getTime() + fajrTime.getTime()) / 2);
  return midpoint;
}
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
//---  Funktion updateDatumAnzeige()
// Zurückgestellt wegen DOM-Ausgabe

// function updateDatumAnzeige()
//
// -----------------------------------------------------------------------------


/** getCurrentDateWithoutTime()
 * Gibt das aktuelle Datum ohne Uhrzeit zurück
 * Beispiel: getCurrentDateWithoutTime() → Thu Jun 20 2025 00:00:00
 */
function getCurrentDateWithoutTime() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** getCurrentTimeString()
 * Gibt die aktuelle Uhrzeit als HH:MM:SS zurück
 * Beispiel: getCurrentTimeString() → "14:35:12"
 */
function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

/** getCurrentDateString()
 * Gibt das aktuelle Datum als YYYY-MM-DD zurück
 * Beispiel: getCurrentDateString() → "2025-06-20"
 */
function getCurrentDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/** parseTimeToDateObject(timeStr)
 * Parst einen Zeitstring (z.B. "14:30") zu einem Date-Objekt (heute)
 * Beispiel: parseTimeToDateObject("14:30") → Thu Jun 20 2025 14:30:00
 */
function parseTimeToDateObject(timeStr, baseDate = new Date()) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const dateObj = new Date(baseDate);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
}

/** calculateTimeDiffInMs
 * Berechnet die Zeitdifferenz zwischen zwei Date-Objekten in Millisekunden
 * Beispiel: calculateTimeDiffInMs(t1, t2) → 60000
 */
function calculateTimeDiffInMs(date1, date2) {
  return date2.getTime() - date1.getTime();
}

/** formatDateToGermanString
 * Wandelt ein Date-Objekt in deutsches Format um: "Donnerstag, 20. Juni 2025"
 * Beispiel: formatDateToGermanString(new Date()) → "Donnerstag, 20. Juni 2025"
 */
function formatDateToGermanString(date) {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}


/**
 * Prüft, ob ein Zeitpunkt in der Vergangenheit liegt
 * Beispiel: isTimeInPast("05:00") → true oder false
 */
function isTimeInPast(timeStr) {
  const target = parseTimeToDateObject(timeStr);
  return new Date() > target;
}

/**
 * Prüft, ob zwei Date-Objekte dasselbe Kalenderdatum haben
 * Beispiel: isSameDate(date1, date2) → true oder false
 */
function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Fügt einem Date-Objekt Minuten hinzu
 * Beispiel: addMinutes(new Date(), 15) → Date+15min
 */
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Rundet ein Date-Objekt auf die nächste volle Minute
 * Beispiel: roundToNextMinute(new Date("2025-06-20T14:23:40")) → 14:24:00
 */
function roundToNextMinute(date) {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  rounded.setMinutes(rounded.getMinutes() + 1);
  return rounded;
}
