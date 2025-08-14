// === main.js (finale Version mit Layer-Steuerung) ===
console.log("DOM loaded. Monatspicker:", document.getElementById("monthPickerView"));

// ======================== Globale Variablen ========================
window.allPrayerTimes = {};
let currentView = "tagesansicht";

let loadedYearMinMonth = 0;
let loadedYearMaxMonth = 11;

const hijriMonthMap = {
  'Muharram': 1,
  'Safar': 2,
  'Rabiʿ al-awwal': 3,
  'Rabiʿ al-thani': 4,
  'Jumada al-awwal': 5,
  'Jumada al-thani': 6,
  'Rajab': 7,
  'Shaʿban': 8,
  'Ramadan': 9,
  'Shawwal': 10,
  'Dhu al-Qiʿdah': 11,
  'Dhu al-Ḥijjah': 12
};

  // Monate gemäß Hijri-Map
const hijriMonthReverseMap = {
  1: 'Muharram',
  2: 'Safar',
  3: 'Rabiʿ al-awwal',
  4: 'Rabiʿ al-thani',
  5: 'Jumada al-awwal',
  6: 'Jumada al-thani',
  7: 'Rajab',
  8: 'Shaʿban',
  9: 'Ramadan',
  10: 'Shawwal',
  11: 'Dhu al-Qiʿdah',
  12: 'Dhu al-Ḥijjah'
};

// Dynamisch erzeugte Anzeige-Namen mit Monatsnummern (für Selectbox)
const hijriMonthDisplayMap = Object.entries(hijriMonthReverseMap).reduce((acc, [num, name]) => {
  const number = String(num).padStart(2, '0');
  acc[num] = `${number} – ${name}`;
  return acc;
}, {});

// === Beginn des Bereichs der Script-Funktionen ===
//--------------------------------------------------------------
//--- fetchAvailableGregYears()
async function fetchAvailableGregYears() {
  try {
    const response = await fetch('api/get_available_gregyears.php');
    const years = await response.json();
    if (!Array.isArray(years)) {
      throw new Error("Antwort ist kein gültiges Array");
    }
    return years;
  } catch (err) {
    console.error("❌ Fehler beim Laden der Jahre:", err);
    return []; // Fallback
  }
}

//--- fetchAvailableHijriYears()
async function fetchAvailableHijriYears() {
  try {
    const response = await fetch('api/get_available_hijriyears.php');
    const years = await response.json();

    if (!Array.isArray(years)) {
      throw new Error("Antwort ist kein gültiges Array");
    }

    // ✅ Filter auf gültige Hijri-Jahreszahlen anwenden
    const filteredYears = years
      .map(y => parseInt(y))
      .filter(y => y >= 1300 && y <= 1600);  // oder ggf. enger z.B. 1400–1500

    return filteredYears;

  } catch (err) {
    console.error("❌ Fehler beim Laden der Jahre:", err);
    return []; // Fallback
  }
}

//--- Helper-Funktion für Formatierung: zweistellig mit führendem Leerzeichen, z.B. ' 1', '10'
function formatMonthNumber(n) {
  return n.toString(); // Kein padStart – nur natürliche Zahl (1–12)
}

//--------------------------------------------------------------
//--- initGregorianSelects()
function initGregorianSelects(years) {
  const gregYearSel  = document.getElementById("gregYear");
  const gregMonthSel = document.getElementById("gregMonth");
  const gregDaySel   = document.getElementById("gregDay");

  const navYearSel   = document.getElementById("navYearSelect");
  const navMonthSel  = document.getElementById("navMonthSelect");

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

// 🔁 Aktuelle Auswahl sichern
  const savedYear  = gregYearSel?.value;
  const savedMonth = gregMonthSel?.value;
  const savedDay   = gregDaySel?.value;


  // Gregorianische Eingabebox versorgen
  if (gregYearSel && gregMonthSel && gregDaySel) {
    gregYearSel.innerHTML = "";
    years.forEach(y => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      gregYearSel.appendChild(opt);
    });

    gregMonthSel.innerHTML = "";
    monthNames.forEach((m, i) => {
      const opt = document.createElement("option");
      opt.value = i + 1;
      opt.textContent = m;
	  //--- Hier die Anpassung mit zusätzlicher Monatsnummer vor dem Monatsnamen
	  const padded = formatMonthNumber(opt.value); // z.B. '5'
      opt.textContent = `${padded} – ${opt.textContent}`; // '5 – Mai'
      gregMonthSel.appendChild(opt);
    });

    gregDaySel.innerHTML = "";
	//--- 31 Tage , muss führende Nullen haben
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d.toString().padStart(2, '0');
      gregDaySel.appendChild(opt);
    }
  }

    // 🧠 Wiederherstellen der gespeicherten Auswahl
    if (savedYear)  gregYearSel.value  = savedYear;
    if (savedMonth) gregMonthSel.value = savedMonth;
    if (savedDay)   gregDaySel.value   = savedDay;


  // Dropdowns der Monatsnavigation versorgen
  if (navYearSel && navMonthSel) {
    navYearSel.innerHTML = "";
    years.forEach(y => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      navYearSel.appendChild(opt);
    });

    navMonthSel.innerHTML = "";
    monthNames.forEach((m, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = m;
      navMonthSel.appendChild(opt);
    });
  }
}


//--------------------------------------------------------------
//--- initHijriSelects()
function initHijriSelects(hijriyears) {
  const hijriYearSel  = document.getElementById("hijriYear");
  const hijriMonthSel = document.getElementById("hijriMonth");
  const hijriDaySel   = document.getElementById("hijriDay");

// 🔁 Aktuelle Auswahl sichern
  const savedYear  = hijriYearSel?.value;
  const savedMonth = hijriMonthSel?.value;
  const savedDay   = hijriDaySel?.value;

 // Felder leeren
  hijriYear.innerHTML  = "";
  hijriMonth.innerHTML = "";
  hijriDay.innerHTML   = "";

  // Tage 1–30  , Keine führenden Nullen bei Hjri
  for (let i = 1; i <= 30; i++) {
    hijriDaySel.appendChild(new Option(i.toString(), i));
  }
  
  //--- Hier die Anpassung mit zusätzlicher Monatsnummer vor dem Monatsnamen
  for (const [num, name] of Object.entries(hijriMonthReverseMap)) {
    const padded = formatMonthNumber(num); // z.B. '5'
    const displayName = `${padded} – ${name}`; // '5 – Jumada al-awwal'
    hijriMonthSel.appendChild(new Option(displayName, num));
  }  

 // NEU: hijriyears aus Datenbank dynamisch verwenden
  hijriyears.forEach(year => {
    hijriYearSel.appendChild(new Option(year.toString(), year));
  });
  
  // 🧠 Wiederherstellen der gespeicherten Auswahl
  if (savedYear)  hijriYearSel.value  = savedYear;
  if (savedMonth) hijriMonthSel.value = savedMonth;
  if (savedDay)   hijriDaySel.value   = savedDay;
}


//--------------------------------------------------------------
//--- loadAvailableYearsAndPopulateSelector()
async function loadAvailableYearsAndPopulateSelector() {
  try {
    //--- Gregorian Jahresdaten laden ------------------
    const gregyears = await fetchAvailableGregYears();
	
    //--- Hijri Jahresdaten laden
    const hijriyears = await fetchAvailableHijriYears();
    // -------------------------------------------------

    const navYearSelect = document.getElementById('navYearSelect');
    navYearSelect.innerHTML = ''; // Jahr-Auswahl leeren

    //--- Doppelter Code, siehe initGregorianSelects
    gregyears.sort((a, b) => a - b);
    for (const year of gregyears) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      navYearSelect.appendChild(option);
    }

    // Standard-Auswahl setzen (aktuelles Jahr oder Fallback: 1. Jahr der Liste)
    const currentYear = new Date().getFullYear();
    if (gregyears.includes(currentYear)) {
      navYearSelect.value = currentYear.toString();
    } else if (gregyears.length > 0) {
      navYearSelect.value = gregyears[0].toString();
    }

    // Gregorian Jahresdaten und Monats-Auswahl initialisieren
    initGregorianSelects(gregyears);

    // Hijri Jahresdaten initialisieren
	initHijriSelects(hijriyears);

    // Erst danach: Gespeicherte Auswahl wiederherstellen (Monat UND Jahr)
    if (window.lastSelectedYear !== undefined) {
      document.getElementById('navYearSelect').value = window.lastSelectedYear;
    }
    if (window.lastSelectedMonth !== undefined) {
      document.getElementById('navMonthSelect').value = window.lastSelectedMonth;
    }

  } catch (error) {
    console.error('Fehler beim Laden der verfügbaren Jahre:', error);
  }
}

  
function convertHijriToGregorian() {
  const day = document.getElementById("hijriDay").value;
  const month = document.getElementById("hijriMonth").value;
  const year = document.getElementById("hijriYear").value;

  logWithTag("convertHijriToGregorian", `Funktion aufgerufen ${day} ${month} ${year}`, "core");

  // API-URL vorbereiten
  const url = `api/convert_date.php?direction=hijri2greg&day=${day}&month=${month}&year=${year}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
	// ➤ Fehlertexte verfeinert
      const output = document.getElementById("gregResult");
      if (data.status === "success") {

        // === Datumsformatierung: yyyy-mm-dd → dd.mm.yyyy ===
        const [yyyy, mm, dd] = data.gregorian.split("-");
        output.textContent = `${dd}.${mm}.${yyyy}`;

      } else if (data.status === "not_found") {
        output.textContent = "⚠️ Datum liegt außerhalb des gespeicherten Datenbereichs.";
      } else {
        output.textContent = "❌ Fehlerhafte Rückmeldung vom Server.";
      }
	})
    .catch(error => {
      console.error("Fehler bei der Umrechnung Hijri → Gregorian:", error);
    });
}


function updateHijriFromGregorian() {
  const day   = document.getElementById("gregDay").value;
  const month = document.getElementById("gregMonth").value;
  const year  = document.getElementById("gregYear").value;

  logWithTag("updateHijriFromGregorian", `Funktion aufgerufen ${day} ${month} ${year}`, "core");

  const resultField = document.getElementById("hijriResult");
  if (!resultField) {
    console.warn("⚠️ #hijriResult nicht im DOM – keine Anzeige möglich.");
    return;
  }

  // Sicherheitscheck: alle Felder belegt?
  if (!day || !month || !year) {
    resultField.innerText = "";
    return;
  }

  // API-URL vorbereiten
  const url = `api/convert_date.php?direction=greg2hijri&day=${day}&month=${month}&year=${year}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        const parts = data.hijri.split('/');
        const hYear = parts[0];
        const hMonth = hijriMonthReverseMap[parseInt(parts[1], 10)];
        const hDay = parseInt(parts[2], 10); // ohne führende Null

        resultField.innerText = `${hDay}. ${hMonth} ${hYear}`;
      } else if (data.status === "invalid_date") {
        resultField.innerText = "❌ Ungültiges Datum – bitte prüfen!";
      } else if (data.status === "not_found") {
        resultField.innerText = "⚠️ Kein entsprechendes Hijri-Datum in der Datenbank gefunden.";
      } else {
        resultField.innerText = "Unbekannter Fehler.";
      }
    })
    .catch(error => {
      console.error("Fehler bei greg2hijri:", error);
      resultField.innerText = "❗ Serverfehler beim Abrufen.";
    });
}



//------------------------------------------------------------------------------
// === function switchView(viewName)
function switchView(viewName) {
  const container       = document.querySelector(".tagesansicht-container");
  const tagesWrapper    = document.getElementById("tagesansicht-wrapper");
  const monthPickerView = document.getElementById("monthPickerView");
  const monatsansicht   = document.getElementById("monatsansicht");

  // Alle Layer ausblenden
  container?.classList.add("hidden");
  tagesWrapper?.classList.add("hidden");
  monthPickerView?.classList.add("hidden");
  monatsansicht?.classList.add("hidden");

  // Den gewünschten Layer einblenden
  switch (viewName) {
    case "tagesansicht":
      container?.classList.remove("hidden");
      tagesWrapper?.classList.remove("hidden");
      break;
    case "monthPickerView":
      monthPickerView?.classList.remove("hidden");
	  loadAvailableYearsAndPopulateSelector();
      break;
    case "monatsansicht":
      monatsansicht?.classList.remove("hidden");
      break;
    default:
      container?.classList.remove("hidden");
      tagesWrapper?.classList.remove("hidden");
  }
  currentView = viewName;
  logWithTag("switchView", `Aktive Ansicht: ${currentView}`, "info");
}


// === Event Binding bei Seitenladen ===
document.addEventListener("DOMContentLoaded", async () => {
  const toMonthBtn = document.getElementById("toggleToMonthBtn");
  const toLayerBtn = document.getElementById("toggleToLayerBtn");
  const toDayBtn = document.getElementById("toggleToDayBtn");
  const toMonthFromLayerBtn = document.getElementById("goToMonthViewBtn");

  if (toMonthBtn) {
    toMonthBtn.addEventListener("click", () => switchView("monthPickerView"));
  }
  if (toLayerBtn) {
    toLayerBtn.addEventListener("click", () => switchView("monthPickerView"));
  }
  if (toDayBtn) {
    toDayBtn.addEventListener("click", () => switchView("tagesansicht"));
  }
  if (toMonthFromLayerBtn) {
    toMonthFromLayerBtn.addEventListener("click", async () => {
      if (!window.allPrayerTimes || Object.keys(allPrayerTimes).length < 300) {
        await loadPrayerTimes(currentDate.getFullYear());
      }
      renderMonthlyView(currentDate.getMonth(), currentDate.getFullYear());
      switchView("monatsansicht");
    });
  }
  
  
  // ##### Initialisierung der Umrechnungsfunktionen in der Datumsauswahl  
  // 📌 Hole verfügbare Jahre und initialisiere alles danach
  try {
    const gyears = await fetchAvailableGregYears();   // Neue Hilfsfunktion unten
    const hyears = await fetchAvailableHijriYears();  // Neue Hilfsfunktion unten
	           
    // ##### Einbindung der Versorgung der Jahressinformation:
    // ##### Geladene Jahre in der Datenbamk?
    await loadAvailableYearsAndPopulateSelector();    // Befüllt Gregorian Selects 
	                                                  // HINWEIS: function ruft initGregorianSelects(years) auf!!! 
	                                                  // HINWEIS: function ruft Hijri-Datumselects(years) auf!!! 

	// EventListener für Hijri Eingabe
	document.getElementById("hijriDay").addEventListener  ("change", convertHijriToGregorian);
    document.getElementById("hijriMonth").addEventListener("change", convertHijriToGregorian);
    document.getElementById("hijriYear").addEventListener ("change", convertHijriToGregorian);
	
	// EventListener für Gregorianische Eingabe
    document.getElementById("gregDay").addEventListener   ("change", updateHijriFromGregorian);
    document.getElementById("gregMonth").addEventListener ("change", updateHijriFromGregorian);
    document.getElementById("gregYear").addEventListener  ("change", updateHijriFromGregorian);

	// Hijri-Umrechnung schon bei Page RELOAD
    updateHijriFromGregorian();

  } catch (error) {
    console.error("❌ Fehler bei Initialisierung:", error);
  }
  
  //---  ✅ Fallback-Initialisierung bei Seitenstart (innerhalb DOMContentLoaded):
  const now = new Date();
  window.lastSelectedYear = now.getFullYear();
  window.lastSelectedMonth = now.getMonth();

  //--- document.addEventListener("DOMContentLoaded")
  
});


//--- Jahresdaten über API-Aufruf laden und in globele Variable allPrayerTimes speichern
// === Globale Datenstruktur allPrayerTimes = {}; === siehe Definition ganz oben im Script
// let allPrayerTimes = {}; // Jahresweise gesammelt

// =============== Daten über API laden ===============

//--------------------------------------------------------------
//--- async function loadPrayerTimes(year)
async function loadPrayerTimes(year) {
  if (Object.keys(allPrayerTimes).some(key => key.startsWith(year))) {	
	logWithTag("loadPrayerTimes", `Daten für Jahr ${year} bereits vorhanden.`, "info");
    return;
  }

  try {
	logWithTag("loadPrayerTimes", `Lade Gebetszeiten für das Jahr ${year}`, "info");
	
    const response = await fetch(`api/load_prayer_times.php?year=${year}`);

    if (!response.ok) {
      throw new Error(`Fehler beim Laden der Daten: ${response.status}`);
    }

    const data = await response.json();

    if (typeof data !== "object" || data === null) {
      throw new Error("❌ [loadPrayerTimes], Unerwartetes Datenformat (kein Objekt)");
    }

    // ✅ Flach in allPrayerTimes kopieren:
    // ✅ NEU: Werden schon als Objekt geliefert vom umgebauten load_prayer_times.php == Das ist aber nicht wahr, ist dort nicht eingebaut
	
    Object.assign(allPrayerTimes, data);
	logWithTag("loadPrayerTimes", `Daten geladen: Jahr ${year}, Einträge: ${Object.keys(data).length}`, "info");
	
  } catch (error) {
    console.error("❌ [loadPrayerTimes], Fehler beim Laden der Gebetszeiten:", error);
    alert("Gebetszeiten konnten nicht geladen werden. Bitte später erneut versuchen.");
  }
}


// === Monatsansicht auslösen nach Auswahl im monthPickerView ===
//--------------------------------------------------------------
//--- window.goToMonthView = async function ()
window.goToMonthView = async function () {
  const  year = parseInt(document.getElementById("navYearSelect").value);
  const month = parseInt(document.getElementById("navMonthSelect").value);

  // Merken für Rückkehr
  window.lastSelectedYear = year;
  window.lastSelectedMonth = month;

  if (!allPrayerTimes[year]) {
    await loadPrayerTimes(year); // nachladen, falls nicht da
  }

  renderMonthlyView(month, year);
  switchView("monatsansicht");
}

// === Zurück zur Tagesansicht (aus dem monthPickerView) ===
function returnToDayView() {
  switchView("tagesansicht");
}

// --- Erweiterte Navigation über Jahresgrenzen hinweg für REL 1.2.1 ---
//----------------------------------------------------------------------
//--- navigateToMonth(newMonth, newYear)
//--- Funktion zum Navigieren zum gewünschten Monat (vor/zurück)
function navigateToMonth(newMonth, newYear) {
  let safeDate = new Date(newYear, newMonth);

  const correctedYear = safeDate.getFullYear();
  const correctedMonth = safeDate.getMonth(); // 0-basiert
  const yearKey = String(correctedYear);

  logWithTag("navigateToMonth", `Korrigiert auf: Monat ${correctedMonth} | Jahr: ${correctedYear}`, "info");

  // Wenn Daten für das Zieljahr noch nicht vorhanden sind, via API nachladen
  if (!window.allPrayerTimes[yearKey]) {
	logWithTag("navigateToMonth", `Lade Gebetszeiten für Jahr ${yearKey} ...`, "core");

    fetch(`api/load_prayer_times.php?year=${yearKey}`)
      .then((res) => res.json())
      .then((data) => {
        // Validierung: Muss ein Objekt mit yearKey enthalten
        if (!data || typeof data !== "object" || !data[yearKey]) {
          console.warn(`⚠️ [navigateToMonth] Warnung: Leere oder ungültige Datenstruktur empfangen für Jahr ${yearKey}.`);
          alert(`Für das Jahr ${yearKey} wurden keine Daten geliefert.`);
          return;
        }

        window.allPrayerTimes[yearKey] = data[yearKey];

        const count = Object.keys(window.allPrayerTimes[yearKey]).length;
	    logWithTag("navigateToMonth", `Daten geladen: Jahr ${yearKey}, Einträge: ${count}`, "core");

        //--- renderMonthlyView aufrufen
        renderMonthlyView(correctedMonth, correctedYear);
      })
      .catch((err) => {
        console.error("❌ [navigateToMonth] Fehler beim Laden der Gebetszeiten:", err);
        alert("Fehler beim Laden der Daten für das gewünschte Jahr.");
      });

  } else {
    logWithTag("navigateToMonth", `Verwende bereits geladene Daten für Jahr ${yearKey}`, "info");

    //--- renderMonthlyView aufrufen	
    renderMonthlyView(correctedMonth, correctedYear);
  }
}


// --- Erweiterte Version von renderMonthlyView() für REL 1.2.1 ---
//-----------------------------------------------------------------
//--- renderMonthlyView(month, year)
function renderMonthlyView(month, year) {

  logWithTag("renderMonthlyView", `renderMonthlyView() ${JSON.stringify({ month, year })}`, "info");

  const monatsansicht = document.getElementById("monatsansicht");
  const yearKey = String(year);

  const safeDate = new Date(year, month);
  year = safeDate.getFullYear();
  month = safeDate.getMonth();
  currentDate = new Date(year, month, 1);
  lastValidMonth = month;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long" }).format(safeDate);

  let html = `
    <div id="monatsansicht" class="monatsansicht-container" style="width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 0.7em; margin-bottom: 10px; font-size: 0.85rem;">
      <button id="prevMonthBtn"><span class="material-symbols-outlined" style="font-variation-settings: 'wght' 700;">arrow_back</span></button>
      <h3 style="margin: 0; font-size: 0.85rem; font-weight: bold;">📅 Monatsansicht ${monthName} ${year}</h3>
      <button id="nextMonthBtn"><span class="material-symbols-outlined" style="font-variation-settings: 'wght' 700;">arrow_forward</span></button>
    </div>

    <div style="background-color: rgba(204, 255, 229, 0.60); font-size: 0.80rem; 
      display: grid; grid-template-columns: 0.6fr 0.8fr repeat(6, 1fr); 
      padding: 0.3em 0.2em; border-bottom: 1px solid #ccc; font-weight: bold;">

      <div style="text-align: left;                         ">Tag    </div>
      <div style="text-align: center;                       ">Hijri  </div>
      <div style="text-align: center;                       ">Fadjr  </div>
      <div style="text-align: center;                       ">Shuruk </div>
      <div style="text-align: right; padding-right: 0.45em; ">Duhr   </div>
      <div style="text-align: right; padding-right: 0.4em;  ">Assr   </div>
      <div style="text-align: center;                       ">Maghrib</div>
      <div style="text-align: right; padding-right: 0.2em;  ">Ishaa  </div>
    </div>

    <div style="max-height: calc(70vh - 1.5em); overflow-y: auto; padding: 0.3em 0.0em; background-color: white; scrollbar-width: none; -ms-overflow-style: none;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem;">
        <tbody>
  `;

//--- Sicherheitsprüfung, ob das Objekt überhaupt initialisiert wurde:
  if (!window.allPrayerTimes?.[yearKey]) {
    console.warn(`⚠️ [renderMonthlyView], allPrayerTimes[${yearKey}] ist nicht geladen.`);
    html += `</tbody></table></div><p style="text-align: center;">Keine Daten für ${year} verfügbar.</p>`;
    monatsansicht.innerHTML = html;
    return;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	///------------------
    logWithTag("renderMonthlyView", `Prüfe Datum: ${dateStr}`, "info");   // DEBUG

    //--- Änderung für flache Struktur mit verschachteltem Jahresobjekt
    const data = window.allPrayerTimes?.[yearKey]?.[dateStr];
    logWithTag("renderMonthlyView", `Datenobjekt: `, "info", data);	      // DEBUG

    if (!data) {
      if (debugMode) console.warn(`⚠️ [renderMonthlyView], Kein Datensatz für ${dateStr} in allPrayerTimes[${yearKey}]`);
      continue;
    }

    //--- Vom Hijri_Date nur den Tagesanteil in die Tabelle einfügen, ohne führende Null
    const hijriDay =  data?.Hijri_Date?.split('/')?.[2] ?? '--';

    html += `
      <tr style="display: grid; grid-template-columns: 0.6fr 0.8fr repeat(6, 1fr); border-bottom: 1px solid #eee;">
        <td style="font-size: 0.78rem; text-align: left; padding-left: 0.5em;"   > ${String(day).padStart(2, "0")}        </td>
        <td style="font-size: 0.78rem; text-align: center;"                      > ${hijriDay}                            </td>
        <td style="font-size: 0.78rem; text-align: center;"                      > ${data.Fadjr.slice(0, 5)}              </td>
        <td style="font-size: 0.78rem; text-align: center;"                      > ${data.Shuruk?.slice(0, 5) || "--:--"} </td>
        <td style="font-size: 0.78rem; text-align: center;"                      > ${data.Duhr.slice(0, 5)}               </td>
        <td style="font-size: 0.78rem; text-align: center;"                      > ${data.Assr.slice(0, 5)}               </td>
        <td style="font-size: 0.78rem; text-align: center;"                      > ${data.Maghrib.slice(0, 5)}            </td>
        <td style="font-size: 0.78rem; text-align: right; padding-right: 0.5em;" > ${data.Ishaa.slice(0, 5)}              </td>
      </tr>
    `;
  }

  html += `
        </tbody>
      </table>
    </div>

    <div style="height: 0.85em; background-color: rgba(204, 255, 229, 0.85); border-top: 1px solid #ccc;"></div>
    <div style="display: flex; justify-content: center; margin-top: 10px;">
      <button id="toggleToDayBtn">
        <span class="material-symbols-outlined" style="font-variation-settings: 'wght' 700;">sync_alt</span> Tagesansicht
      </button>
      &nbsp;&nbsp;&nbsp;
      <button id="toMonthPickerBtn">
        <span class="material-symbols-outlined" style="font-variation-settings: 'wght' 700;">event</span> Datumsauswahl
      </button>
    </div>
  `;

  monatsansicht.innerHTML = html;

  document.getElementById("prevMonthBtn")?.addEventListener("click",     () => navigateToMonth(month - 1, year));
  document.getElementById("nextMonthBtn")?.addEventListener("click",     () => navigateToMonth(month + 1, year));
  document.getElementById("toggleToDayBtn")?.addEventListener("click",   () => switchView("tagesansicht"));
  document.getElementById("toMonthPickerBtn")?.addEventListener("click", () => switchView("monthPickerView"));
}

