<?php
// index.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

// MIME-Typ auf HTML setzen
header('Content-Type: text/html; charset=utf-8');

require_once  $_SERVER['DOCUMENT_ROOT'] . '/includes/db_config.php';

?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo "Gebetszeiten " . $dataCity; ?> </title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@700" rel="stylesheet" />
	<!-- NEU: Einbindung -->
    <script src="utils/js/logUtils.js"></script>
    <script src="utils/js/timeUtils.js"></script>	
	<script src="assets/js/main.js?v=<?php echo time(); ?>" defer></script>
	<link rel="stylesheet" type="text/css" href="assets/css/gebetszeiten.css">
</head>
<body>

<!-- Hier Beginn des body <div>  -->
<div>
  <!-- Hier Beginn der class tagesansicht-container  -->
  <div class="tagesansicht-container">

<?php
//----------------- Beginn des PHP-Teils --------------------

function Format_DATA($timestamp) {
    return date("H:i", strtotime($timestamp));
}
function formatHijriDate($hijriDate) {
    $hijriDate = trim(str_replace(' H', '', $hijriDate));
    $parts = explode('/', $hijriDate);
    if (count($parts) !== 3) return $hijriDate . ' H';
    list($year, $month, $day) = $parts;
    $hijriMonths = [1 => 'Muharram', 2 => 'Safar', 3 => 'Rabiʿ al-awwal', 4 => 'Rabiʿ al-thani',
        5 => 'Jumada al-awwal', 6 => 'Jumada al-thani', 7 => 'Rajab', 8 => 'Shaʿban',
        9 => 'Ramadan', 10 => 'Shawwal', 11 => 'Dhu al-Qiʿdah', 12 => 'Dhu al-Ḥijjah'];
    return intval($day) . '.' .' ' . $hijriMonths[(int)$month] . ' ' . $year . ' H';
}
function formatiereDatumDeutsch($datum) {
    $date = new DateTime($datum);
    $wtage  = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    $monate = ["Januar", "Februar", "März", "April", "Mai", "Juni",
               "Juli", "August", "September", "Oktober", "November", "Dezember"];
    return $wtage[(int)$date->format('w')] . "," . $date->format('j') . ". " . $monate[(int)$date->format('n') - 1] . " " . $date->format('Y');
}

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Verbindung fehlgeschlagen: " . $conn->connect_error);

$heutesql  = date("Y-m-d");
$morgensql = date("Y-m-d", strtotime('+1 day'));
$sql = "SELECT * FROM $table WHERE Gregorian_Date IN ('$heutesql', '$morgensql') ORDER BY Gregorian_Date ASC";
$result = $conn->query($sql);
$heute = date("d.m.Y H:i");

if ($result->num_rows > 0) {
	if ( $result->num_rows) {
        // Die Daten werden erfolgreich abgerufen
        // var_dump($result->fetch_all(MYSQLI_ASSOC)); // Zeigt die abgerufenen Daten in der Konsole

        // Abrufen der Daten und Zuordnen von Variablen
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        // Sicherstellen, dass $rows nicht leer ist
        if (isset($rows[0])) {
          $row = $rows[0];
		} else {
           // Fehlerbehandlung, falls keine Daten vorhanden sind
           echo "Keine Gebetszeiten-Daten gefunden.";
           exit; // Stoppe die Ausführung
        }

        // ---- Für die Verarbeitung der Fadjr-Zeit für Morgen ----
        $morgenFadjr = isset($rows[1]["Fadjr"]) ? $rows[1]["Fadjr"] : $row["Fadjr"];
		
		//--- Mappen der Variablen für die Verwaltung Hidjri.Datum (today und tommorrow) im Javascript
        $hijriDatum  = formatHijriDate($rows[0]["Hijri_Date"]);
        if ($hijriDatum !== null) {
          $hijriDatum = trim(str_replace(' H', '', $hijriDatum));
        } else {
          $hijriDatum = ''; // oder ein Fallback-Wert
        }
		$hijri_today = $hijriDatum;  
		
        $hijriDatum2  = formatHijriDate($rows[1]["Hijri_Date"]);
        if ($hijriDatum2 !== null) {
          $hijriDatum2 = trim(str_replace(' H', '', $hijriDatum2));
        } else {
          $hijriDatum2 = ''; // oder ein Fallback-Wert
        }
		$hijri_tomorrow = $hijriDatum2;  
		
		// ---------------------- Anzeige Gregorian Wochentag und Datum laden --------------
        $anzeigeDatum = formatiereDatumDeutsch($row["Gregorian_Date"]);

        // --- Beginn der Ausgabeformatierung der PHP/HTML Pagedaten		
        echo '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 1em; margin-top: 0.0em;">';
        echo '<span><button id="infoBtn">Info</button></span>';
		echo '<span id="countdown" style="flex: 1; text-align: right;">Lade Countdown...</span>';
        // echo '<span id="countdown">Lade Countdown...</span>';
        echo '</div>';

        echo '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em; margin-top: 0.2em;">';
          echo '<span class="flex-start">' . "Gebetszeiten " . $dataCity . '</span>';
        echo '</div>';
		
		//-----------##### <!-- Fading Switcher Tagesansicht HTML-Teil -->     #####--------------
		echo '<div style="text-align: center; margin: 0.8rem 0;">';
        echo '<div class="outer-conversion-wrapper-tagesansicht fade-in" id="conversionBox">';
        echo '  <div class="conversion-content">';
        echo '    <div id="fadingSwitcher" class="fading-text-wrapper">3. Muharram 1447</div>';
        echo '    <div class="conversion-line gregorian-date" id="datumAnzeige" style="font-weight: bold;">' . $heute . '</div>';
        echo '  </div>';
        echo '</div>';	
		echo '</div>';
		//-----------##### END <!-- Fading Switcher Tagesansicht HTML-Teil -->  #####--------------

        // ---------------- Horizontale Nebentabelle --------------------------
        echo '<table class="sec-table-horizontal">';
		  echo '<tr>';
		    echo '<td>';
              echo '<div class="secondary-prayer-box">';
                echo '<div>Shuruk</div>';
                echo '<div>' . Format_DATA($row["Shuruk"]) . '</div>';
              echo '</div>';
		    echo '</td>';
		    echo '<td> &nbsp; </td>';
			echo '<td>';
              echo '<div class="secondary-prayer-box">';
                echo '<div>Jumuah</div>';
                echo '<div>' . $jumuahTime . '</div>';
              echo '</div>';
		    echo '</td>';
		  echo "</tr>";
        echo '</table>';
        // --------------- END Horizontale Nebentabelle ------------------------

        // ------------------------------------------
        $offsets = ["Fadjr" => $offsetFadjr, "Duhr" => $offsetDuhr, "Assr" => $offsetAssr, "Maghrib" => $offsetMaghrib, "Ishaa" => $offsetIshaa];
        // ------------------------------------------
		
        // ----------------------------------------------------------------------
        // ---- PHP-Tabellenausgabe Horizontale Tabelle -------------------------
        // ----------------------------------------------------------------------
        echo "<table class='table-horizontal'>";
        echo "<tr><th>Fadjr</th><th>Duhr</th><th>Assr</th><th>Maghrib</th><th>Ishaa</th></tr>";
        echo "<tr>";
        foreach (["Fadjr", "Duhr", "Assr", "Maghrib", "Ishaa"] as $p) {
			echo "<td class='" . strtolower($p) . "' data-prayer='$p'>" . Format_DATA($row[$p]) . "</td>";
        }
        echo "</tr>";
        echo "<tr>";
        foreach (["Fadjr", "Duhr", "Assr", "Maghrib", "Ishaa"] as $p) {
            $offset = $offsets[$p] ?? 0;
            echo "<td class='col-offset'>&nbsp;+" . $offset . "</td>";
        }
        echo "</tr>";
        echo "</table>";
        // ----------------------------------------------------------------------
		
        // ----------------------------------------------------------------------
        // ------- Vertikale Tabelle mit 5 Pflichtgebeten + Offset-Spalte -------
        // ----------------------------------------------------------------------
        // ---- Wrapper für mittige Ausrichtung (Flexbox-Struktur) ----
        echo "<div class='prayer-wrapper'>";
          // Obere Haupttabelle mit Pflichtgebeten + Offset
          echo "<table class='table-vertical'>";
          foreach (["Fadjr", "Duhr", "Assr", "Maghrib", "Ishaa"] as $p) {
              $offset = $offsets[$p] ?? 0;
              echo "<tr>
                      <th class='col-label'>$p</th>
                      <td class='col-time " . strtolower($p) . "' data-prayer='$p'>" . Format_DATA($row[$p]) . "</td>
                      <td class='col-offset'>+" . $offset . "</td>
                    </tr>";
          }
          echo "</table>";
        echo "</div>";
        // ---- END Wrapper für mittige Ausrichtung (Flexbox-Struktur) ----

        // -------------- Vertikale Nebentabelle ----------------------------------
        echo '<table class="sec-table-vertical">';
		  echo '<tr>';
		    echo '<td>';
              echo '<div class="secondary-prayer-box">';
                echo '<div>Shuruk</div>';
                echo '<div>' . Format_DATA($row["Shuruk"]) . '</div>';
              echo '</div>';
		    echo '</td>';
		    echo '<td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>';  // Anpassung der Gesamtbreite incl. der beiden Boxen
		    echo '<td>';
              echo '<div class="secondary-prayer-box">';
                echo '<div>Jumuah</div>';
                echo '<div>' . $jumuahTime . '</div>';
              echo '</div>';
		    echo '</td>';
		  echo "</tr>";
        echo '</table>';
        // -------------- END Vertikale Nebentabelle ------------------------------


        // ------------- Link zu den Quelldaten  --------------
	    echo '<div style="text-align: right;">';
          echo '<span class="flex-ende">&nbsp;&#9770;&nbsp;<a href="https://app.izaachen.de/" target="_blank" rel="noopener noreferrer" >app.izaachen.de</a></span>';
        echo '</div>';

    } else {
        echo "<h3>Gebetszeiten für Dortmund</h3><p>Keine Daten für heute ($heute) gefunden.</p>";
    }
} else {
    // Fehler bei der SQL-Abfrage
    echo "Fehler bei der SQL-Abfrage: " . $conn->error;
}
// Verbindung schließen
$conn->close();

//----------------- Hier Ende des PHP-Teils --------------------
?>
    <div style="text-align: right;">
      <span class="sw-version">REL 1.3.2</span> <!-- Release Anzeige -->
    </div>

    <!-- NEU: Umschaltbereich für Tagesansicht -->
    <div id="tagesansicht-wrapper">
      <!-- Bereits generierter Inhalt bleibt außerhalb -->
      <div style="display: flex; justify-content: center;">
        <button id="toggleToMonthBtn"><span class="material-symbols-outlined" style="font-variation-settings: 'wght' 700;">event</span> Datumsauswahl</button>
      </div>
    </div>

  </div> <!-- Hier ← ENDE class tagesansicht-container aus PHP-Teil -->


  <!-- DATUMSAUSWAHL: class datumsauswahl-container, oder auch monthPickerView-Zwischenlayer genannt -->
  <div id="monthPickerView" class="datumsauswahl-container hidden">
    <h3>📅 Monat & Jahr wählen</h3>
    <label for="navMonthSelect">&nbsp;Monat:</label>
    <select id="navMonthSelect" class="select-unified">
      <option value="0">Januar</option>
      <option value="1">Februar</option>
      <option value="2">März</option>
      <option value="3">April</option>
      <option value="4">Mai</option>
      <option value="5" selected>Juni</option>
      <option value="6">Juli</option>
      <option value="7">August</option>
      <option value="8">September</option>
      <option value="9">Oktober</option>
      <option value="10">November</option>
      <option value="11">Dezember</option>
    </select>
    <label for="navYearSelect">Jahr:</label>
    <select id="navYearSelect" class="select-unified" style="margin-right: 0.2rem;"></select>
    <br><br>

    <!-- Buttons im monthPickerView-Zwischenlayer -->
    <button onclick="returnToDayView()">
      <span class="material-symbols-outlined" style="font-variation-settings: 'wght' 700; vertical-align: middle; display: inline-block;">arrow_back</span>
	  &nbsp;Zur Tagesansicht
    </button>
    <button onclick="goToMonthView()" class="right-align-fix">Zur Monatsansicht&nbsp;
      <span class="material-symbols-outlined" style="font-variation-settings: 'wght' 700; vertical-align: middle; display: inline-block;">arrow_forward</span>
    </button>
  
    <div class="outer-conversion-wrapper">
      <!-- 🔁 GREGORIAN → HIJRI UMWANDLUNG -->
      <div class="outer-conversion-wrapper cover">Kalenderumrechnung</div>
      <div class="conversion-box">
	    <div>&nbsp;</div>
        <h4>📅 Gregorianisches Datum</h4>
        <div class="date-select-group">
          <select id="gregDay" class="select-unified select-day"></select>
          <select id="gregMonth"></select>
          <select id="gregYear"></select>
        </div>
        <div class="result-display"> ↪️ Hijri: <span id="hijriResult">---</span></div>
      </div>

      <!-- 🔁 HIJRI → GREGORIAN UMWANDLUNG -->
      <div class="conversion-box">
        <h4>🕌 Hijri-Datum</h4>
        <div class="date-select-group">
          <select id="hijriDay" class="select-unified select-day"></select>
          <select id="hijriMonth"></select>
          <select id="hijriYear"></select>
        </div>
        <div class="result-display"> ↪️ Gregorian: <span id="gregResult">---</span></div>
      </div>
    </div>

  </div>  <!-- DATUMSAUSWAHL: Zwischenlayer  END  -->

  <!-- MONATSANSICHT: Zielcontainer für renderMonthlyView -->
  <div id="monatsansicht" class="monatsansicht-container hidden">
    <h3 style="text-align:center;">Monatsansicht (Platzhalter)</h3>
    <p style="text-align:center;">Hier erscheint später die Navigation & Anzeige pro Monat</p>

    <div style="display: flex; justify-content: center; margin-top: 10px;">
      <button id="toggleToDayBtn"><span class="material-symbols-outlined" style="font-variation-settings: 'wght' 700;">sync_alt</span> Tagesansicht</button>
    </div>
  </div>
  <!-- END MONATSANSICHT: Zielcontainer für renderMonthlyView -->

<!-- Hier Ende des body <div>  -->
</div>

<script>
const prayerTimes = {
    Fadjr:        '<?= $row["Fadjr"]   ?>',
    Shuruk:       '<?= $row["Shuruk"]  ?>',
    Duhr:         '<?= $row["Duhr"]    ?>',
    Assr:         '<?= $row["Assr"]    ?>',
    Maghrib:      '<?= $row["Maghrib"] ?>',
    Ishaa:        '<?= $row["Ishaa"]   ?>',
    FadjrNextDay: '<?= $morgenFadjr    ?>'
};
// Ausgabe der Gebetszeiten in der Konsole
logWithTag("Page RELOAD", "Gebetszeiten: ", "info", prayerTimes);

//--- Variablen für Hijri-Datum Umschaltung zur Maghrib Gebetszeit & hijri/gregorian-Fader
const    hijriToday  =  '<?= $hijri_today    ?>'
const hijriTomorrow  =  '<?= $hijri_tomorrow ?>'

//--- Variablen für hijri/gregorian-Fader
const gregorianToday =  '<?= $anzeigeDatum   ?>'


//---------------------- Variablenübergabe für Anwendungen aus dem db_config.php File: -----------
const activeAusJS             = '<?= intval($activeAus)    ?>'   //--- Ausschaltung AKTIV-Kennung aller Gebetszeiten (in Minuten, default = 10)
const assrOneHourAusOptJS     = '<?= $assrOneHourAusOpt    ?>'   // Option1:  Assr 1 std. vor Maghrib-Zeit ausschalten  (true = Option ein, sonst false)
const middleNightOptJS        = '<?= $middleNightOpt       ?>'   // Option2:  Islamische Definition der Mitte der Nacht (true = Option ein, sonst false)
const blinkDurationMinutesJS  = '<?= $blinkDurationMinutes ?>'   // Dauer des Blinkeffekts in Minuten (Standard: 2)

const skalFac = 60 * 1000;                                 // Skalierung: Minuten in Millisekunden
const blinkDurationMs = blinkDurationMinutesJS * skalFac;  // scalFac = Rechnet die Millisekunden in Minuten um

                                                          // Ausgabe der Anwenderparameter aus db_config.php
logWithTag("Page RELOAD", `Anwenderparameter aus db_config.php:  1. activeAus ${activeAusJS} 2. assrOneHourAusOpt ${assrOneHourAusOptJS} 3. middleNightOpt ${middleNightOptJS} 4. blinkDurationMinutes ${blinkDurationMinutesJS}`, "core");

//---------------------  #################################################################### -----
//
//------------------------- Globale Variablen Definitionen --------------------------

const BLINK_DAUER_MS     = (blinkDurationMinutesJS || 2) * skalFac;  // Zeitwert: Parameter aus db_config in msec aufbereiten
let activeKennungAusMsec = activeAusJS * skalFac;                    // Zeitwert: Parameter aus db_config in msec aufbereiten

let previousActivePrayer = null;

let blinkTimeout = null;

let hijriUpdated = null;

window.diffCountDown = 0;               //--- Countdown-Zähler jetzt global
window.hijriDatum = hijriToday;         //--- hijriDatum jetzt global, Init.: mit hijriToday

let deactivateAllActivePrayerTimestriggered = null;  // Triggermerker für diese Funktion definieren

// -----------------------------------------------------------------------------------

// ---- NEU: Für REL 1.2.1 Datenobjekt countDownObj  global definieren  --------------
window.countDownObj = {};


// --- ############## Zentrale Datenstruktur: blinkMonitoring ################
//
// ==================================================
// Globale Datenstruktur für Blinküberwachung
// ==================================================
// 🔍 Zweck:
// live: enthält Werte für den Normalbetrieb
// sim:  enthält Werte für den Simulationsmodus
// 
// wird von der Funktion monitorBlinkingLayer() überwacht
// 
blinkLayerObj = {
  live: {
    timestampBlinkOn: null,
    timestampBlinkOff: null,
    aktivePrayer: null,
    blinkStartRequested: false,  // 👈 NEU
    blinkenAktiv: false,
    aktivKennungRequested: false,
	aktivKennungSet: false       // 👈 NEU
  },
  sim: {
    timestampBlinkOn: null,
    timestampBlinkOff: null,
    aktivePrayer: null,
    blinkStartRequested: false,  // 👈 NEU
    blinkenAktiv: false,
    aktivKennungRequested: false,
	aktivKennungSet: false       // 👈 NEU
  }
};

//--- Globale Variablen END --------------------------------

//---  ########################################################## ---
//---
//---  ZENTRALE Hilfsfunktionen
//---
// ------------------------------------------------------------------
//---  Funktion initCountDownObj
function initCountDownObj() {
  const skalFac = 60 * 1000; // Skalierung: Minuten in Millisekunden

  // Maghrib: heute
  const today = new Date();
  const maghribDate = parseTimeToDateObject(prayerTimes.Maghrib, today);

  // Fadjr: morgen
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const fadjrDateNextDay = parseTimeToDateObject(prayerTimes.FadjrNextDay, tomorrow);

  // Islamische Mitternacht berechnen (als Date-Objekt)
  const islamicMidnight = getIslamicMidnight(maghribDate, fadjrDateNextDay);

  // Differenz in Millisekunden von jetzt bis islamischer Mitternacht
  const diffToMidnightMs = islamicMidnight.getTime() - Date.now();
  const middleNightMs = Math.max(diffToMidnightMs, 0); // nie negativ

  countDownObj = {
    Fadjr:   activeAusJS * skalFac,
    Shuruk:  activeAusJS * skalFac,
    Duhr:    activeAusJS * skalFac,
    Assr:    assrOneHourAusOptJS ? 60 * skalFac : activeAusJS * skalFac,
    Maghrib: activeAusJS * skalFac,
    Ishaa:   middleNightOptJS ? middleNightMs : activeAusJS * skalFac
  };

  logWithTag("initCountDownObj", "Page RELOAD: Objektdaten countDownObj", "core", countDownObj);
}


//---  ########################################################## ---
//---
//---  ZENTRALER Working_Layer
//---
// ==================================================
// Zentrale Überwachungsfunktion für das Blinken
// ==================================================
// 🛠 Hinweise:
// Wird zyklisch in der setInterval(...)-Schleife aufgerufen (z.B. jede Sekunde).
// 
// Alle Events (E1–E4) sind enthalten.
//
// Das Verhalten ist deterministisch und vollständig getrennt für Live- und Simulationsebene.
// Aufruf:  monitorBlinkingLayer(eventType) mit 
//          "EventCatA"    Aufruf in der 1 sec-Loop
//          "EventCatB"    Aufruf in der function deactivateAllActivePrayerTimes()
//
function monitorBlinkingLayer(eventType) {
  const now = Date.now();

  Object.entries(blinkLayerObj).forEach(([layerKey, layer]) => {

    switch (eventType) {
        case "EventCatA":
            if (!layer || !layer.aktivePrayer) return;

            const activePrayer = layer.aktivePrayer;

            // === [E1] Blinken starten bei blinkStartRequested
            if (layer.blinkStartRequested) {
              const selector = `td[data-prayer="${activePrayer}"]`;
              document.querySelectorAll(selector).forEach(cell => {
                cell.classList.add("blinking");        // <=== HIER wird Blinken-Aktiv gesetzt!
              });
              layer.blinkStartRequested = false;       // <=== HIER wird Status Blinken-Aktiv requested gelöscht
              layer.blinkenAktiv = true;               // <=== HIER wird Status Blinken-Aktiv gesetzt!
              logWithTag("monitorBlinkingLayer", `[${layerKey}] START Blinken für ${activePrayer}`, "info");
            }

            // === [E2]/[E3] Überwachung: Ist Blinkdauer überschritten?
            if (layer.blinkenAktiv && now > layer.timestampBlinkOff) {
              const selector = `td[data-prayer="${activePrayer}"]`;
              document.querySelectorAll(selector).forEach(cell => {
                cell.classList.remove("blinking");     // <=== Blinken ausschalten
              });
              layer.blinkenAktiv = false;              // <=== HIER wird Status Blinken-Aktiv gelöscht
              layer.aktivKennungRequested = true;      // <=== HIER wird Status Aktiv-Kennung requested gesetzt!
              logWithTag("monitorBlinkingLayer", `[${layerKey}] ENDE Blinken für ${activePrayer}`, "info");
            }

            // === [E4] Nachbereitung: aktiv-Kennung setzen bei aktivKennungRequested:
            if (layer.aktivKennungRequested) {
              const selector = `td[data-prayer="${activePrayer}"]`;
              document.querySelectorAll(selector).forEach(cell => {
                cell.classList.add("aktiv");           // <=== Aktiv-Kennung setzen!
              });
              layer.aktivKennungRequested = false;     // <=== HIER wird Status Aktiv-Kennung requested gelöscht
              layer.aktivKennungSet = true;            // <=== HIER wird Status Aktiv-Kennung gesetzt!
              logWithTag("monitorBlinkingLayer", `[${layerKey}] aktiv-Kennung gesetzt: ${activePrayer}`, "info");
            }
            break;

        case "EventCatB":
		    // === [E5] Nachbereitung: Status aktiv-Kennung rückgesetzt
		    layer.aktivKennungSet = false;             // <=== HIER wird Status Aktiv-Kennung gelöscht
            break;

        default:
            logWithTag("monitorBlinkingLayer", `❌ Unbekannter Event-Typ: '${eventType}'`, "warn");
    }
  });
}

// ================== function isBlinkingNow =====================
// Hilfsfunktion (bisher noch nicht genutzt)
//
function isBlinkingNow(layer = "live") {
  return blinkLayerObj[layer]?.blinkenAktiv || false;
}

// ===================== startBlinkingForPrayer(prayerName, layer) =====================
// Interface-Funktion zum Starten des Blinkens für einen bestimmten Gebetsnamen
// layer: "live" für Produktivbetrieb, "sim" für Tests
//
// startBlinkingForPrayer("Shuruk",     "sim");     // für Test / Simulation
// startBlinkingForPrayer(activePrayer, "live");    // im Livebetrieb
//
function startBlinkingForPrayer(prayerName, layer = "live") {
    const now = new Date();
    const timestampBlinkOn = now.getTime();
    const timestampBlinkOff = timestampBlinkOn + BLINK_DAUER_MS;

    blinkLayerObj[layer] = {
      timestampBlinkOn: Date.now(),
      timestampBlinkOff: Date.now() + BLINK_DAUER_MS,
      aktivePrayer: prayerName,
      blinkStartRequested: true,
      blinkenAktiv: false,
      aktivKennungRequested: false,  // ✅ Ergänzt
      aktivKennungSet: false         // ✅ Ergänzt
    };
    logWithTag("startBlinkingForPrayer", `🔁 Start Blinken für '${prayerName}' auf Layer '${layer}'`, "core");
}


// ---######################### TESTFUNKTION: ##################################
// --- Bedienung:  Im Debug-Modus in der DEV-Konsole aufrufen
//     Beispielaufruf: testfunction("Fadjr");
//
let simulationActive = null;
//
// ======================= function testfunction()  ============================
// <-- Testfunction sofort global registrieren  (implizit durch: window.<fkt-name) = function() 
window.testfunction = function() {

    logWithTag("testfunction", `testfunction() ist global registriert um ${getCurrentTimeString()}`, "info");

    const now = new Date();    //--- Für Datum/Zeit Parameter
	
    let SimActivePrayer = null;
    let Simselector = null;

    logWithTag("testfunction", `🔥 testfunction() wurde **aufgerufen** um ${getCurrentTimeString()}`, "core");

    //---------------- Simulation starten --------------
	logWithTag("testfunction", `Start: testfunction()`, "info");

    simulationActive = true;

    //--- ################ Test-Code ###################
    startBlinkingForPrayer("Shuruk", "sim");

    //---------------- Simulation beenden --------------
	simulationActive = false;
    logWithTag("testfunction", `Stop: testfunction()`, "info");
	return `testfunction() wurde ausgeführt um ${now.toLocaleTimeString()}`;
}
// -------------- Testfunktion: END -------------------------------------

//--- ###################################################################### ---


// === function getNextPrayerTime()
function getNextPrayerTime() {
	//--- Funktion bildet die Weiterschaltung der Gebetszeiten gemäß Gebetszeiten-Tabelle ab
	//--- Rückgabewert ist  nextPrayer, nextTime , der nächste Gebetszeiten-Eintrag der Tabelle

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextPrayer = null;
    let nextTime = null;
    let foundCurrent = false;

	// Vergleichsliste aus prayerTimes nehmen, aber FadjrNextDay filtern
    const prayerNames = Object.keys(prayerTimes).filter( key => key !== "FadjrNextDay" );
    for (const [prayer, time] of Object.entries(prayerTimes)) {
        if (prayer === "FadjrNextDay") continue;

        const [h, m] = time.split(":").map(Number);
        const prayerMinutes = h * 60 + m;

        // Falls die nomentane Zeit < Gebetszeit ist (Funktioniert ab Fadjr bis Ishaa, ab Ishaa bis Mitternacht wird in der Tabelle kein Treffer gefunden)
        if (currentMinutes < prayerMinutes) {
            nextPrayer = prayer;
            nextTime = time;
            break;
        }
    }
    if (!nextPrayer) {     //-- Gebetszeiten-Tabelle durchlaufen, aber kein matching
	
	                       // Fallback: Für die Zeit ab Ishaa bis Mitternacht gilt: Fadjr von Morgen						   
        nextPrayer = "Fadjr"; // von morgen
        nextTime = prayerTimes["FadjrNextDay"];
		logWithTag("getNextPrayerTime", `Fallback auf FadjrNextDay aktiviert`, "core");
    }
    return { nextPrayer, nextTime };
}

//--- ++++++++++++++++++++++++++++++++ Testabschnitt ++++++++++++++++++++++++++

// === function updateCountdown()
function updateCountdown() {
    const now = new Date();

    // Aktuelle Gebetszeit bestimmen
    let activePrayer = null;

	//const entries = Object.entries(prayerTimes).filter(([key]) => key !== "Shuruk" && key !== "FadjrNextDay");
	//--- NEU: Erkenntnis: Die Flanke beim Übergang von Fadjr-Ende auf Shuruk wird benötigt, 
	//--- um die AKTIV-Kennung von Fadjr abschalten zu können (Erkennung in function highlightActivePrayer)
	//--- Konsequenz ist der Restpunkt: (erledigt)
	//--- Da Shuruk keine Gebetszeit ist, muss das Schalten der AKTIV-Kennung bei Shuruk unterdrückt werden
	//--- Vergleichsliste aus prayerTimes nehmen, aber FadjrNextDay filtern
	const entries = Object.entries(prayerTimes).filter(([key]) => key !== "FadjrNextDay");

    //--- Vergleich aller Einträge der Liste prayerTimes 
	//--- Die Variable nextPrayerTime muss ausserhalb der For-Schleife definiert werden
    let nextPrayerTime = null;	
    for (let i = 0; i < entries.length; i++) {
        const [prayer, time] = entries[i];
		
		// Timestring in ein Date-Objekt umwandeln
		const prayerTime = getDateFromTimeString(time);

        if (i < entries.length - 1) {
            const [_, nextTime] = entries[i + 1];
            nextPrayerTime = getDateFromTimeString(nextTime);
        } else {
            // Letztes Gebet: Ende ist Fadjr von morgen
            nextPrayerTime = getDateFromTimeString(prayerTimes["FadjrNextDay"]);
        }
        if (now >= prayerTime && now < nextPrayerTime) {
            activePrayer = prayer;
            break;
        } 
    }
	//--- Wurde KEIN 'activePrayer' für die Zeit nach Ishaa bis Fadjr gefunden? 
	if ( activePrayer === null ) {
		activePrayer = "Ishaa";   // Fallback (damit gefixt): Für die Zeit nach Ishaa bis Fadjr muss die aktive Gebetszeit: "Ishaa" sein!
    }

    // Countdown berechnen
    const { nextPrayer, nextTime } = getNextPrayerTime();
	
    const [nh, nm] = nextTime.split(":").map(Number);
    const nextDate = new Date(now);	
	
	// Aktuelle Uhrzeit bereits in const now!
    // Extrahiere die Ishaa-Zeit ("HH:MM") und baue ein Date-Objekt daraus
	const ishaaDate = getDateFromTimeString(prayerTimes["Ishaa"]);

    // Vergleich: Sind wir aktuell nach Ishaa, aber noch vor Mitternacht?
	if (now > ishaaDate) {
        nextDate.setDate(now.getDate() + 1); // Tageswechsel: Falls wir nach Ishaa, aber noch vor Mitternacht sind, 
		                                     // zählt die nächste Gebetszeit (z.B. Fadjr) zum nächsten Kalendertag
    }
	// Uhrzeit für nächste Gebetszeit setzen
    nextDate.setHours(nh, nm, 0, 0);
	
 	// Zeitdifferenz = Ladewert für den Countdown-Zähler in msec
    window.diffCountDown = nextDate - now + 1000;  // Korrektur aus Testerfahrung: +1000 msec Puffer hinzufügen
	
	//-- Ausgabe der Information 'nächste Gebetszeit in:' und des Countdown-Zählers 
    const countdownElem = document.getElementById("countdown");
    if (diffCountDown > 0) {
        const hours   = Math.floor(diffCountDown / 1000 / 60 / 60);
        const minutes = Math.floor((diffCountDown / 1000 / 60) % 60);
        const seconds = Math.floor((diffCountDown / 1000) % 60);
        // Zahlen in Strings mit führender Null konvertieren
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');

        countdownElem.textContent = `${nextPrayer} in: ${hh}:${mm}:${ss}`;
    } 
    else { countdownElem.textContent = `Zeit für ${nextPrayer}!`; }
	
    //--- Fehler debuggen: Falls nach Mitternacht der Fehler stattfindet: activePrayer === null
    if (activePrayer === null) {
		logWithTag("updateCountdown", ` Fehler, kein activePrayer : ${activePrayer}`, "core");
	}

    // --- Weiter bei Initialdurchlauf nach RELOAD Page:  ------
    if (previousActivePrayer === null) {
		
		//--- ### Abschlussaktivitäten Initialdurchlauf nach RELOAD Page: 

        //--- Grundzustand herstellen ----------------------
		//--- Alle alten Klassen entfernen -----------------
        document.querySelectorAll("td").forEach(td => {
            td.classList.remove("aktiv", "blinking");
        });

        //+++ Für den activePrayer: +++
        //--- Nur aktiv setzen, ohne Blinken 
        //--- ==> Für 'Shuruk' das AKTIV-Setzen unterdrücken
	    if (activePrayer !== 'Shuruk') {

            const selector = `td[data-prayer="${activePrayer}"]`;
            document.querySelectorAll(selector).forEach(cell => {
               cell.classList.add("aktiv");
            });
        }	
        //--- Hier wird der Hochlauf beendet 
	    //--- previousActivePrayer auf aktiven Prayer SETZEN
        previousActivePrayer = activePrayer;

	    //--- Erweiterung: Ergänzung: Hijri-Umschaltung auch bei Reload durchführen,
		//--- wenn folgende Bedingungen erfüllt sind: Es ist Magrib oder Ishaa und die Zeit ist vor 24:00 Uhr
        if ((activePrayer === 'Maghrib' || activePrayer === 'Ishaa') && now.getHours() < 24) {
		    logWithTag("updateCountdown", `Page-RELOAD vor Mitternacht während aktivem Gebet: ${activePrayer}`, "core");
    
            hijriUpdated = false;  // Flanke für Umschaltung freigeben
	        logWithTag("updateCountdown", `Bearbeitung für feature Umschaltung Hijri-Datum zur Gebetszeit: ${activePrayer} ${hijriUpdated}`, "core");
					   
	        //--- Bearbeitung für feature "Umschaltung Hijri-Datum zur Magrib-Gebetszeit" ---
            // Extrahiere die Maghrib-Zeit ("HH:MM") und baue ein Date-Objekt daraus	
		    maghribDate = getDateFromTimeString(prayerTimes["Maghrib"]);		
            updateHijriDateIfArrived(now, maghribDate);
        } else {
			logWithTag("updateCountdown", `Reload-Path: Keine Hijri-Umschaltung nötig – Zustand: ${activePrayer}}`, "info");
        }

        //---  Funktion initCountDownObj : Datenobjekt für das Ausschalten der AKTIV-Kennung initialisieren
        initCountDownObj();                                    
 
		logWithTag("updateCountdown", `Ende des Initialdurchlaufs nach RELOAD Page, aktive Gebetszeit: ${activePrayer}`, "core");

        return; 
        //--- ####################### Ende des Initialdurchlaufs nach RELOAD Page
    }

    //--- ####################### Hier geht der zyklisch durchlaufene Teil weiter:
    // Visuelles Update, Blinken setzen, Umschaltung Hijri-Datum zur Magrib-Gebetszeit
	// Löschen der AKTIV-Kennung für alle Gebetszeiten
    highlightActivePrayer(activePrayer);

    //--- Übergabe des Countdown-Zählers: Function: AKTIV-Kennungen ausschalten aufrufen
    deactivateAllActivePrayerTimes(activePrayer, diffCountDown);
	
    // ==================================================
    // Zentrale Überwachungsfunktion für das Blinken
    // ==================================================
    monitorBlinkingLayer("EventCatA");
	
	//--- LOOP-Ende Meldung
    logWithTag("updateCountdown", `cycle end: activePrayer = ${activePrayer} | previousActivePrayer = ${previousActivePrayer}}`, "info");

//--- function updateCountdown END ---
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//--- Implementierung für feature "Löschen der AKTIV-Kennung bei Eintreffen jeder Gebetszeit 
// === function deactivateAllActivePrayerTimes(diffCountdown)
function deactivateAllActivePrayerTimes(activePrayer, diffCountdown) {

    if (!deactivateAllActivePrayerTimestriggered && diffCountdown > 1000) {           // 1000 msec Restzeit, darf nicht stören
		// Weitere Bearbeitung nur bei Triggerung und Countdown noch nicht abgelaufen
	    logWithTag("deactivateAllActivePrayerTimes", `TRIGGERED: activePrayer, diffCountdown, countDownObj[activePrayer] ${activePrayer} ${diffCountdown} ${countDownObj[activePrayer]}`, "debug");

        //--- Hier den Zeitvergleich einbauen:
		if ( diffCountdown <= countDownObj[activePrayer] ) {
			logWithTag("deactivateAllActivePrayerTimes", `Zeitvergleich: activePrayer, diffCountdown <= countDownObj[activePrayer] ${activePrayer} ${diffCountdown} ${countDownObj[activePrayer]}`, "core");

            // AKTIV-Kennung für alle Zellen zurücksetzen
            document.querySelectorAll("td").forEach(td => {
                td.classList.remove("aktiv");
            });

            //--- Function zur Anzeige des Status AKTIV-Kennung gelöscht im Datenobjekt blinkLayerObj aufrufen
            monitorBlinkingLayer("EventCatB");

			//--- nur einmaliger Bearbeitung für jede Gebetszeit, Trigger hier sofort ausschalten
	        deactivateAllActivePrayerTimestriggered = true;
            //  '', ); }
            logWithTag("deactivateAllActivePrayerTimes", `Aktivkennungen entfernt bei Countdown: ${diffCountdown} (ms)`, "info");
        }
    }
    //--- Diesen Spezialfall ins LogFile schreiben
	if (debugMode && diffCountdown <= 1000) { logWithTag("deactivateAllActivePrayerTimes", `Countdown unter 1000ms, keine Deaktivierung der AKTIV-Kennung mehr.`, "info"); }
}

//--- Implementierung für feature "Umschaltung Hijri-Datum zur Magrib-Gebetszeit"
//--- Aufruf in function highlightActivePrayer(), welche bereits das Eintreten von Gebetszeit 'Maghrib' erkennt,
//--- und in function updateCountdown(), welche nach RELOAD aufgerufen wird, dort im RELOAD-Pfad!
// === function updateHijriDateIfArrived(currentTime, maghribTime)
function updateHijriDateIfArrived(currentTime, maghribTime) {

    logWithTag("updateHijriDateIfArrived", `Aufruf getriggert!`, "core");
	logWithTag("updateHijriDateIfArrived", `Altes Hijri-Datum: ${window.hijriDatum}`, "info");
		
    if (!hijriUpdated && currentTime >= maghribTime) {
        hijriUpdated = true;
                            // Ablegen des Hijri-Date des nächsten Tages:
                            // => Eigentliche Umschaltung des Hijri-Datums für Anzeige in function fadeCycle()
        window.hijriDatum = hijriTomorrow;
		logWithTag("updateHijriDateIfArrived", `Neues Hijri-Datum: ${window.hijriDatum}`, "core");
    }
}
//--- #########################################################

// === function highlightActivePrayer(currentPrayer)
function highlightActivePrayer(currentPrayer) {
	const now = new Date();
	//--- Nichts zu tun, wenn es keinen Wechsel der Gebetszeit gegeben hat
    if (currentPrayer === previousActivePrayer) return;

	//--- Neu eingetretene Gebetszeit loggen
	logWithTag("highlightActivePrayer", `Neu eingetretene Gebetszeit: ${currentPrayer}`, "core");


    //--- Triggermerker freischalten als Vorbereitung für die Abschaltung der AKTIV-Kennung
	//--- nach Feststellung des Eintretens dieses Gebetszeitenwechsels.
	deactivateAllActivePrayerTimestriggered = false;

	
	//--- Reset Erkennung Flankenmerker neue Gebetszeit:
    previousActivePrayer = currentPrayer;

    //--- Da Shuruk keine "echte" Gebetszeit ist, muss das Blinken und Schalten der AKTIV-Kennung 
	//--- bei Shuruk unterdrückt werden
	if (currentPrayer !== 'Shuruk') {

        // STEP_1: Alle Zellen zurücksetzen
        document.querySelectorAll("td").forEach(td => {
            td.classList.remove("aktiv", "blinking");
        });
        logWithTag("highlightActivePrayer", `STEP 1: Alle Zellen (aktiv, blinking) zurücksetzen`, "core");

//------ +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ----------------------
//------ Diesen Block ersetzt durch Aufruf des neuen Blinkmonitorings:
        startBlinkingForPrayer(currentPrayer, "live");    // im Livebetrieb   ---------------------------
//------ +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ----------------------
    }
	
    // STEP_4: Bearbeitung für feature 'Umschaltung Hijri-Datum zu Magrib-Gebetszeit'
	if (currentPrayer === 'Maghrib') {
        //--- HINWEIS: Wegen Verriegelung oben wird dieser Code nur einmal bei Eintritt der 'Maghrib'-Gebetszeit durchlaufen
	    //--- Bedingung für die Bearbeitung Umschaltung Hijri-Datum auf den nächsten Hijri-Tag erreicht
	    hijriUpdated = false;          //--- Trigger 'hijriUpdated' bei Eintritt der 'Maghrib'-Gebetszeit bereit schalten

        // Extrahiere die Maghrib-Zeit ("HH:MM") und baue ein Date-Objekt daraus	
		maghribDate = getDateFromTimeString(prayerTimes["Maghrib"]);
		logWithTag("highlightActivePrayer", `STEP 4: Bearbeitung für feature 'Umschaltung Hijri-Datum zu Magrib-Gebetszeit' ${maghribDate}`, "core");		
					   
	    //--- Bearbeitung für feature "Umschaltung Hijri-Datum zur Magrib-Gebetszeit" ---
        updateHijriDateIfArrived(now, maghribDate);
	}
    //--- Log Eintrag am Ende von highlightActivePrayer()
	logWithTag("highlightActivePrayer", `Aktuelle Uhrzeit: ${getCurrentTimeString()}`, "info");
}

//---############################################################################
//
//-------------------------------------------------------------------------------
//--- function getCurrentPrayerName ---
// Die Funktion getCurrentPrayerName() durchsucht die gebetszeiten-Tabelle nach den heutigen Gebetszeiten.
// Die Suchefunktion läuft rückwärts!
// 
// Für akt. Zeit größer oder gleich einem Listenelement, 
// also max. von Fadjr bis Ishaa Zeit, und darüber hinaus bis 23:59 Uhr
// Fallback: Ab 00:00 Uhr bis Fadjr wird als Fallback Ishaa geliefert!
//
// === function getCurrentPrayerName()
function getCurrentPrayerName() {
  const now = new Date().getTime();
  
  // Vergleichsliste aus prayerTimes nehmen, aber FadjrNextDay filtern
  const prayerNames = Object.keys(prayerTimes).filter( key => key !== "FadjrNextDay" );

  //--- Durch Zeitvergleich den CurrentPrayer Name ermitteln:
  for (let i = prayerNames.length - 1; i >= 0; i--) {
	  
    const prayer = prayerNames[i];
	const prayerDate = getDateFromTimeString(prayerTimes[prayer]);

    if (now >= prayerDate.getTime()) {
      logWithTag("getCurrentPrayerName", `Aktuelles Listenelement: ${prayer}`, "core");
      return prayer; // DAS Gebet hat soeben begonnen oder läuft gerade
    }
  }
  logWithTag("getCurrentPrayerName", `Fallback Gebet: "Ishaa"`, "core");

  return "Ishaa";    // Fallback, Nachts ab 00:00 bis 1 sec. vor Fadjr
}

//--- Die Function 'updateTableView' muss ganz am Ende des Scripts stehen -----
//--- ### Achtung: Diese Funktion stellt sicher, dass die ---------------------
//--- ###          Gebets-Tabellen AUSGABE erfolgt ----------------------------

// === function updateTableView()
function updateTableView() {

  logWithTag("updateTableView", `Gebetsdaten Tabellen sichtbar geschaltet!`, "core");

  const hor1  = document.querySelector('.table-horizontal');
  const vert1 = document.querySelector('.table-vertical');

  const hor2  = document.querySelector('.sec-table-horizontal');
  const vert2 = document.querySelector('.sec-table-vertical');

  if (window.innerWidth >= 600) {
    // Sichtbarkeit und Position sicherstellen (Horizontal)
        hor1.style.display     = 'table';    // Horizontale Tabelle sichtbar schalten
        hor1.style.opacity     = '1';        // Horizontale Opacity 100% sichtbar
        hor1.style.visibility  = 'visible';  // Sichtbarkeit aktivieren
        hor2.style.display     = 'table';    // Horizontale Nebentabelle sichtbar schalten 
        hor2.style.opacity     = '1';        // Horizontale Opacity 100% sichtbar
        hor2.style.visibility  = 'visible';  // Sichtbarkeit aktivieren

        vert1.style.display    = 'none';     // Vertikale Tabelle nicht sichtbar schalten
        vert2.style.display    = 'none';     // Vertikale Nebentabelle nicht sichtbar schalten

  } else { 
    // Sichtbarkeit und Position sicherstellen (Vertikal)
        vert1.style.display    = 'table';    // Vertikale Tabelle sichtbar schalten
        vert1.style.opacity    = '1';        // Vertikale Opacity 100% sichtbar
        vert1.style.visibility = 'visible';  // Vertikale Tabelle Sichtbarkeit aktivieren
        vert2.style.display    = 'table';    // Vertikale Nebentabelle sichtbar schalten 
        vert2.style.opacity    = '1';        // Vertikale Opacity 100% sichtbar
        vert2.style.visibility = 'visible';  // Vertikale Tabelle Sichtbarkeit aktivieren

        hor1.style.display     = 'none';     // Horizontale Tabelle nicht sichtbar schalten
        hor2.style.display     = 'none';     // Horizontale Nebentabelle nicht sichtbar schalten
  }
}

//--- function updateDatumAnzeige ------------------
//--- Gibt die Sec-Ausgabe von Datum und Uhrzeit ---
//--- (DAS Feld unten links aus). ------------------
// === function updateDatumAnzeige()
function updateDatumAnzeige() {
  const jetzt = new Date();

  // Datum im Format TT.MM.JJJJ
  const tag = String(jetzt.getDate()).padStart(2, '0');
  const monat = String(jetzt.getMonth() + 1).padStart(2, '0'); // Monat ist 0-basiert
  const jahr = jetzt.getFullYear();

  // Uhrzeit mit Sekunden
  const stunde = String(jetzt.getHours()).padStart(2, '0');
  const minute = String(jetzt.getMinutes()).padStart(2, '0');
  const sekunde = String(jetzt.getSeconds()).padStart(2, '0');

  // Gesamtausgabe z.B. "29.05.2025 13:22:47"
  const datumUhrzeit = `${tag}.${monat}.${jahr} ${stunde}:${minute}:${sekunde}`;

  // DOM-Ausgabe
  const feld = document.getElementById("datumAnzeige");
  if (feld) {
    feld.textContent = datumUhrzeit;
  }
}
// ########################## Funktionen END ###########################

window.addEventListener('resize', updateTableView);
window.addEventListener('load', updateTableView);

//let countdownElement;  // Variable später noch benutzt???

window.addEventListener("DOMContentLoaded", () => {

  // ####### HIGH PRIORITY: #################################
  // +++++ Ohne diese Funktion werde keine Tabelleninhalte angezeigt ++++
  // Initiales Setzen der aktuellen Gebetszeit (ohne Blinken)
  //
  const initialPrayer = getCurrentPrayerName();
 
  if (initialPrayer) {	
    logWithTag("RELOAD STEP 1", `initialPrayer gefunden: ${initialPrayer}`, "core");

    //--- Request (Triggerung) nach RELOAD der Page ---
	hijriUpdated = false;      //--- Trigger 'hijriUpdated' im Hochlauf bereit schalten
    //--- Request (Triggerung) nach RELOAD der Page ---
	deactivateAllActivePrayerTimestriggered = false;
    logWithTag("RELOAD STEP 2", `INFO: Trigger 'deactivateAllActivePrayerTimestriggered' und 'hijriUpdated' wieder bereit geschaltet!`, "core");
                               //--- Datumsupdate wird bei Eintreten von Maghrib ausgeführt, 
		                       //--- wenn: (!hijriUpdated && currentTime >= maghribTime)	
    logWithTag("RELOAD STEP 3", `INFO: Hijri-Datum: ${hijriToday} Hijri-Datum next day: ${hijriTomorrow}`, "core");
	
    //--- ####################################################################
    //	
    // Markierung ohne Blinkeffekt
    document.querySelectorAll(".aktiv").forEach(el => {
      el.classList.remove("aktiv");
      el.classList.remove("blinking");
   });
   // +++++ ------------------------------------------------------- ++++
   // ##### AKTIV-Kennung als Eigenschaft in classList der Elemente hinzufügen
    const indexMap = ["Fadjr", "Shuruk", "Duhr", "Assr", "Maghrib", "Ishaa"];
    const idx = indexMap.indexOf(initialPrayer);
    const horRow = document.querySelector(".table-horizontal tr:nth-child(2)");
    if (horRow && horRow.children[idx]) {
      horRow.children[idx].classList.add("aktiv");
    }

    document.querySelectorAll(".table-vertical tr").forEach(tr => {
      const th = tr.querySelector("th");
      const td = tr.querySelector("td");
      if (th && td && th.textContent.trim().toLowerCase() === initialPrayer.toLowerCase()) {
        td.classList.add("aktiv");
      }
    });
	// #####
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
	
  // Funktion updateDatumAnzeige() beim Laden direkt aufrufen und dann jede Sekunde aktualisieren
  updateDatumAnzeige();
  setInterval(updateDatumAnzeige, 1000);
});

//--- ENDE der JS-Implementierung für die Basisversion 1.0 (Tagesansicht) --->
</script>

<script>
//--- 2) Beginn JS-Extension für Umschaltung Tagesansicht / Monatsansicht   --->
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".tagesansicht-container");
  const tagesWrapper = document.getElementById("tagesansicht-wrapper");
  const monatsWrapper = document.getElementById("monthPickerView");
  const toMonthBtn = document.getElementById("toggleToMonthBtn");
  const toDayBtn = document.getElementById("toggleToDayBtn");

  if (toMonthBtn) {
    toMonthBtn.addEventListener("click", () => {
      container.classList.add("hidden");
      tagesWrapper.classList.add("hidden");
      monatsWrapper.classList.remove("hidden");
    });
  } else {
    console.warn("⚠️ Button 'toggleToMonthBtn' nicht gefunden!");
  }

  if (toDayBtn) {
    toDayBtn.addEventListener("click", () => {
      container.classList.remove("hidden");
      tagesWrapper.classList.remove("hidden");
      monatsWrapper.classList.add("hidden");
    });
  } else {
    console.warn("⚠️ Button 'toggleToDayBtn' nicht gefunden!");
  }
});
</script>

<script>
  window.addEventListener('DOMContentLoaded', function () {
    const box = document.getElementById('conversionBox');
    if (box) {
      // Test: kleine Verzögerung, um Browser-Rendering sicherzustellen
      setTimeout(() => {
        box.classList.add('visible');
      }, 300); // 300 ms ist meist mehr als ausreichend
    } else {
      console.warn("⚠️ conversionBox nicht gefunden!");
    }
  });
</script>

<!-- Fading Switcher Tagesansicht JS-Teil -->
<script>
document.addEventListener("DOMContentLoaded", () => {
	
  const switcher = document.getElementById("fadingSwitcher");
  let index = 0;

  const texts = [
    `${gregorianToday}`,        // --- Bei RELOAD nach Eintritt der Magrib- / Ishaa Gebetszeit:
    `Initialisierung...`        // --- Init-String als Platzhalter fürs Hijri-Date: Warten auf Update zur Initialisierung des Hijri-Date
  ]; 
  const textAnz = texts.length; //--- Anzahl der Texte to be switched: 2

  // Parametrierbare Zeiten
  const FADE_IN_DURATION = 4000;           // z.B. 4 Sek.
  const HOLD_DURATION = 1500;              // Zeit bei voller Sichtbarkeit
  const FADE_OUT_MULTIPLIER = 0.7;         // 70% schneller = weniger als halbe Zeit
  const FADE_OUT_DURATION = FADE_IN_DURATION * FADE_OUT_MULTIPLIER;

  function fadeCycle() {
	
    // Fade-In Phase
    switcher.style.transition = `opacity ${FADE_IN_DURATION}ms ease-in-out`;
    switcher.style.opacity = 1;

    // Nach In + Hold → Fade-Out starten
    setTimeout(() => {
      switcher.style.transition = `opacity ${FADE_OUT_DURATION}ms ease-in-out`;
      switcher.style.opacity = 0;

      // Nach Fade-Out → Text wechseln (with toggle of index) & neu starten
      setTimeout(() => {
        index = (index + 1) % textAnz;

        // --- Texte bei jedem Aufruf neu speichern: 
	    // --- Damit ist ein Update nach Datumswechsel möglich (wichtig z.B. für Hijri-Date nach Magrib- oder Ishaa Gebetszeit)
        const texts = [
          `${gregorianToday}`,
          `${window.hijriDatum}`
        ];
        // --- Rekursiver Aufruf der Funktion fadeCycle()
        switcher.textContent = texts[index];
        fadeCycle();
      }, FADE_OUT_DURATION);

    }, FADE_IN_DURATION + HOLD_DURATION);

  }

  // Initialisieren des 1. Durchlaufs der function fadeCycle() mit index = 0
  switcher.textContent = texts[index];
  fadeCycle();
});
</script>

<!-- MODAL Info-Text overlay, wird per JS geladen), JS-Teil -->
<script type="module">
//--- Die beiden Textteile aus separater Datei als ES6-Modul importieren:
import { modalText1, modalText2 } from './assets/js/infotexts.js';

//--- Neue JS-Implementierung für die extended Version 1.1  (Monatsansicht) --->
//--- 1) Verwaltung Info-Button
document.addEventListener('DOMContentLoaded', function () {
  const infoBtn = document.getElementById('infoBtn');
  const modal = document.getElementById('infoModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody1 = document.getElementById('modalBody1');
  const modalBody2 = document.getElementById('modalBody2');
  const content = modal.querySelector('.modal-content');  //--- Für Scrollposition = Immer TOP of Text

  // Event infoBtn:
  infoBtn.addEventListener('click', () => {
    // Dynamischer Inhalt
    modalTitle.textContent = "Funktionsübersicht";

    // Aktuellen Info-Text laden:
    modalBody1.innerHTML = modalText1;
    modalBody2.innerHTML = modalText2;
    modal.classList.remove('hidden');
    // Nur Inhalt scrollen, Scrollposition = Immer TOP of Text (Textanfang)
    content.scrollTop = 0;
  });
  // Event closeBtn:
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
});

</script>

<!-- MODAL Info-Text overlay, wird per JS geladen), HTML-Teil -->
<div id="infoModal" class="modal hidden">
  <div class="modal-content" style="max-height: 70vh; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;">
    <h3 id="modalTitle"></h3>
    <table border="1" style="width: 100%; text-align: left;">
	  <thead style="background-color: lightgrey;">      <!-- Farbmix aus lightgrey und 65% mintfarben für den Anwender-Teil -->
	  	<tr><th style="background-color: rgba(204, 255, 229, 0.65);">👤 Anwender</th></tr> 
	  </thead>
	  <tbody>
	    <tr><td id="modalBody1" style="background-color: #f9f9f9; font-weight: normal; font-size: 0.80rem;"></td></tr> 
      </tbody>
	</table>
    <table border="1" style="width: 100%; text-align: left;">
	  <thead style="background-color: lightgrey;">
	  	<tr><th>⚙️ Administrator</th></tr> 
	  </thead>
	  <tbody>
	    <tr><td id="modalBody2" style="background-color: #f9f9f9; font-weight: normal; font-size: 0.80rem;"></td></tr> 
      </tbody>
	</table>
    <button id="closeModalBtn">Schließen</button>
  </div>
</div>

</body>
</html>
