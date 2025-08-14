<?php

// === DEBUG START ===
// Fehlerausgabe nur intern loggen, niemals direkt im Output
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_error.log');
error_reporting(E_ALL);

// Logging nur bei Erfolg – kein Fehler im Browser
function log_debug($message) {
    return;                  // logging disabled gesetzt!
    @file_put_contents(__DIR__ . "/convert_date_debug.log", $message . "\n", FILE_APPEND);
}

// === DEBUG TEST ===
log_debug("== convert_date.php aufgerufen ==");
log_debug(print_r($_GET, true));

// === HEADER ===
header('Content-Type: application/json');

// WICHTIG: Erst die Konfiguration laden
require_once  $_SERVER['DOCUMENT_ROOT'] . '/includes/db_config.php';
// WICHTIG: Authentifikation prüfen:
require_once  $_SERVER['DOCUMENT_ROOT'] . '/includes/authrequest.php';

if (!isAuthorizedRequest($modusflag, $allowedRefererDomain, $validApiKey)) {
    http_response_code(403);
    echo json_encode(["error" => "Zugriff verweigert"]);
    exit;
}

try {
    // ----------- Daten abrufen ----------- FROM $table (siehe: db_config.php)
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);

} catch (PDOException $e) {
    log_debug("DB-Verbindung fehlgeschlagen: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'DB-Verbindung fehlgeschlagen']);
    exit;
}

// === Parameter einlesen ===
$direction = $_GET['direction'] ?? '';

//------------------------------------
$day   = isset($_GET['day'])   ? intval($_GET['day'])   : 0;
$month = isset($_GET['month']) ? intval($_GET['month']) : 0;
$year  = isset($_GET['year'])  ? intval($_GET['year'])  : 0;

//------------------------------------
$day   = ltrim($day, '0');
$month = ltrim($month, '0');
$year  = intval($year);
$day   = ($day === '') ? 0 : intval($day);
$month = ($month === '') ? 0 : intval($month);

log_debug("Richtung: $direction | Tag: $day | Monat: $month | Jahr: $year");

// === Gregorianisch → Hijri ===
if ($direction === 'greg2hijri') {
    // $month++; Monatszahl kommt bereits 1-basiert aus JS → KEINE Änderung

    if (!checkdate($month, $day, $year)) {
        log_debug("Ungültiges Datum");
        echo json_encode(['status' => 'invalid_date']);
        exit;
    }
    $date = sprintf("%04d-%02d-%02d", $year, $month, $day);

    // ----------- Daten abrufen ----------- FROM $table (siehe: db_config.php)
    $stmt = $pdo->prepare("SELECT Hijri_Date FROM $table WHERE Gregorian_Date = ?");
    $stmt->execute([$date]);
    $result = $stmt->fetchColumn();

    if ($result) {
        echo json_encode(['status' => 'success', 'hijri' => $result]);
    } else {
        echo json_encode(['status' => 'not_found']);
    }
    exit;

// === Hijri → Gregorian ===
} elseif ($direction === 'hijri2greg') {
    $hijri = "$year/$month/$day";

    // ----------- Daten abrufen ----------- FROM $table (siehe: db_config.php)
    $stmt = $pdo->prepare("SELECT Gregorian_Date FROM $table WHERE Hijri_Date = ?");
    $stmt->execute([$hijri]);
    $result = $stmt->fetchColumn();

    if ($result) {
        echo json_encode(['status' => 'success', 'gregorian' => $result]);
    } else {
        echo json_encode(['status' => 'not_found']);
    }
    exit;

// === Falsche Richtung ===
} else {
    echo json_encode(['status' => 'error', 'message' => 'Ungültiger Parameter: direction']);
    exit;
}
