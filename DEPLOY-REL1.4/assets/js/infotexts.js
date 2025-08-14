export const modalText1 = `

<div class="info-section user">
  <p>
    Die Gebetszeiten gelten für <strong>Dortmund</strong>.<br><br>
    &bull; Das <strong>Hijri-Datum</strong> wechselt bei Eintreten des<br>
    &nbsp;&nbsp;&nbsp;Maghrib-Gebets.<br>
    &bull; Die aktuelle Gebetszeit wird durch eine <strong>AKTIV</strong>-<br>
    &nbsp;&nbsp;&nbsp;Kennung hervorgehoben.<br>
    &bull; Eine fest eingestellte Zeit (siehe ADMIN-Parameter)<br>
    &nbsp;&nbsp;&nbsp;vor Eintreffen der neuen Gebetszeit wird die <strong>AKTIV</strong>-<br>
    &nbsp;&nbsp;&nbsp;Kennung der aktuellen Gebetszeit aufgehoben.<br>
    &bull; Beim Eintritt einer neuen Gebetszeit wird für<br>
    &nbsp;&nbsp;&nbsp;2 Minuten ein <strong>Blinken</strong> ausgelöst. (parametrierbar)<br><br>

    &bull; Neue Features in Release 1.2:<br>
    &nbsp;&nbsp;&nbsp;<strong>Datumsauswahl</strong> mit Anwahl von Monat und Jahr.<br>
    &nbsp;&nbsp;&nbsp;<strong>Monatsübersicht</strong> mit Navigation durch alle Monate<br>
    &nbsp;&nbsp;&nbsp;des verfügbaren Datenbestandes.<br><br>

    &bull; Neue Features in Release 1.2.1:<br>
    &nbsp;&nbsp;&nbsp;<strong>Assr</strong> kann optional <strong>1 Stunde vor Maghrib</strong><br>
    &nbsp;&nbsp;&nbsp;deaktiviert werden (makrūh-Zeit).<br>
    &nbsp;&nbsp;&nbsp;<strong>Ishaa</strong> kann optional zur <strong>islamischen Mitte<br>
    &nbsp;&nbsp;&nbsp;der Nacht</strong> deaktiviert werden.<br><br>

    &bull; Neue Features in Release 1.3:<br>
    &nbsp;&nbsp;&nbsp;Konvertierung des <strong>gregorianischen</strong> Kalender-<br>
    &nbsp;&nbsp;&nbsp;datums in ein <strong>Hijri</strong> Kalenderdatum und umgekehrt,<br>
    &nbsp;&nbsp;&nbsp;basierend auf dem verfügbaren Datenbestand.<br>
    &nbsp;&nbsp;&nbsp;<strong>Offsetzeiten</strong> vom Eintreten der Gebetszeit bis zum<br>
    &nbsp;&nbsp;&nbsp;Gebetsbeginn.<br><br>

    <strong>Datenquelle:</strong><br>
    Gebetszeiten des IZA Aachen, freigegeben vom ZMD.<br>
    Die Applikation importiert diese Daten in eine eigene Datenbank.<br><br>

    Weitere <strong>Features</strong> können auf Nachfrage implementiert werden.<br>
    Für Anfragen bitte das <strong>Kontaktformular</strong> auf der Homepage benutzen!
  </p>
</div>

`;

export const modalText2 = `

<div class="info-section admin">
  <p>
    &bull; <strong>Parameter</strong>:<br>
	&nbsp;&nbsp;&nbsp;Name der Datenbank-Tabelle:<br>
	&nbsp;&nbsp;&nbsp;<code>$table = prayer_times</code> (default)<br>
	&nbsp;&nbsp;&nbsp;Gebetszeiten-Tabellen für die Stadt:<br>
	&nbsp;&nbsp;&nbsp;<code>$dataCity = Dortmund</code> &nbsp;&nbsp;(default)<br>
    &nbsp;&nbsp;&nbsp;Ausschalten der <strong>AKTIV</strong>-Kennung vor der nächsten<br>
    &nbsp;&nbsp;&nbsp;Gebetszeit: <code>$activeAus = 10</code>(Min), Basiswert<br>
    &nbsp;&nbsp;&nbsp;Die Deaktivierung erfolgt über eine neue<br>
    &nbsp;&nbsp;&nbsp;Countdown-Steuerung vor dem Folgegebet.<br><br>

    &bull; Bei Eintritt einer neuen Gebetszeit:<br>
	&nbsp;&nbsp;&nbsp;<strong>Blinkzeit</strong>: <code>$blinkDurationMinutes = 2</code>(Min)<br><br>

    &bull; Release 1.2.1: <strong>Neue Optionen</strong>:<br>
    &nbsp;&nbsp;&nbsp;<code>$assrOneHourAus = true/false</code><br>
    &nbsp;&nbsp;&nbsp;<code>$middleNight&nbsp;&nbsp;&nbsp; = true/false</code><br><br>

    &bull; Release 1.3: <strong>Neue Parameter</strong>:<br>
    &nbsp;&nbsp;&nbsp;<code>$jumuahTime</code>&nbsp;&nbsp; Zeit des <strong>Jumuah</strong> Gebets.<br><br>

    &nbsp;&nbsp;&nbsp;<strong>Offsetzeiten</strong> für jede Gebetszeit in (Min) vom<br>
    &nbsp;&nbsp;&nbsp;Eintreten der Gebetszeit bis Gebetsbeginn:<br>
    &nbsp;&nbsp;&nbsp;<code>$offsetFadjr</code><br>
    &nbsp;&nbsp;&nbsp;<code>$offsetDuhr</code><br>
    &nbsp;&nbsp;&nbsp;<code>$offsetAssr</code><br>
    &nbsp;&nbsp;&nbsp;<code>$offsetMaghrib</code><br>
    &nbsp;&nbsp;&nbsp;<code>$offsetIshaa</code>
  </p>
</div>

`;
