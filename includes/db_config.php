<?php
//--------- $modusflag == Automatisches Parameter-Flag ("local" oder "webspace" -------
$modusflag = (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) ? 'local' : 'webspace';

//-----  Automatische Variable für den Modus "local" oder "webspace" --------------
//-----  Zum Schutz vor unerwünschten Referern 
//-----  (Security-Massnahme gegen Datenbank-Daten Hacks) 
//-----  PAR: hier Anwender-Domain eintragen:
//-----             ↓↓↓↓↓↓↓↓↓↓      ----------
$anwenderDomain = "zero-clue.de";
$allowedRefererDomain = ($modusflag === 'local') ? 'localhost' : $anwenderDomain;
//-----  API-Key für mobileApp
$validApiKey = "9~8tj>dtgirtgW-Z§$%&";

if ($modusflag == "webspace") { //--- Datenbank-Parameter des Web-Providers
 $host = "mysql37.1blu.de";     // PAR: Webserver des Providers
 $user = "s368321_3714699";     // PAR: Benutzername für Datenbank und Zugang für MySQLadmin
 $pass = "RdyKVrk?NZ9mRg0";     // PAR: Passwort für Datenbank und Zugang für MySQLadmin
 $db   = "db368321x3714699";    // PAR: Name der Datenbank im Webspace
}
if ($modusflag == "local") {
$host = "localhost";            // XAMPP-Webserver läuft auf localhost
$user = "root";                 // Standardbenutzer bei XAMPP
$pass = "";                     // Kein Passwort bei XAMPP
$db   = "meine_datenbank";      // PAR: Name der Datenbank in der Simulation XAMPP
}
//---------------------------   ADMIN - Parameter ---------------------------
$table    = "prayer_times";     // Name der Datenbank-Tabelle
$dataCity = "Dortmund";         // Datenbank enthält die Gebetszeiten-Tabellen für die angegebene Stadt

//---------------------------   Anwendungs - Parameter ---------------------------
$activeAus = 10;                // AKTIV-Kennung ausschalten (in Minuten) vor Eintritt 
                                // einer neuen Gebetszeit (Default = 10 Min)
							 
$assrOneHourAusOpt = true;      // Option1:  Assr 1 Std. vor Maghrib-Zeit ausschalten  (true = Option ein, sonst false)
$middleNightOpt    = true;      // Option2:  Islamische Definition der Mitte der Nacht (true = Option ein, sonst false)
$blinkDurationMinutes = 2;      // BLINK-Zeit (in Minuten) (Default = 2 Min)

$jumuahTime        = "14:00";   // Zeit des Jummah-Gebets während der MESZ ( Während der MEZ hier ändern )

$offsetFadjr       = 30;        // Offsetzeit (in Minuten) vom Eintreten Fadjr   bis zum Gebetsbeginn
$offsetDuhr        = 10;        // Offsetzeit (in Minuten) vom Eintreten Duhr    bis zum Gebetsbeginn
$offsetAssr        = 10;        // Offsetzeit (in Minuten) vom Eintreten Assr    bis zum Gebetsbeginn
$offsetMaghrib     = 5;         // Offsetzeit (in Minuten) vom Eintreten Maghrib bis zum Gebetsbeginn
$offsetIshaa       = 10;        // Offsetzeit (in Minuten) vom Eintreten Ishaa   bis zum Gebetsbeginn

//---------------------------   Anwendungs - Parameter END -----------------------

// Datenbankverbindung nur aufbauen, wenn noch nicht vorhanden
if (!isset($pdo)) {
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        die("Verbindung fehlgeschlagen: " . $e->getMessage());
    }
}

?>
