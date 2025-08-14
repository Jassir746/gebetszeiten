<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// WICHTIG: Erst die Konfiguration laden
require_once  $_SERVER['DOCUMENT_ROOT'] . '/includes/db_config.php';
// WICHTIG: Authentifikation prüfen:
require_once  $_SERVER['DOCUMENT_ROOT'] . '/includes/authrequest.php';

// Logging nur bei Erfolg – kein Fehler im Browser
function log_debug($message) {
    // return;                   logging disabled gesetzt!
    @file_put_contents(__DIR__ . "/load_parameters_debug.log", $message . "\n", FILE_APPEND);
}

// === DEBUG TEST ===
// log_debug("== load_parameters.php aufgerufen ==");
// log_debug(print_r($_GET, true));

if (!isAuthorizedRequest($modusflag, $allowedRefererDomain, $validApiKey)) {

    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $apiKey  = $_SERVER['HTTP_X_API_KEY'] ?? '';
	
	//--- DEBUG: 
	log_debug("ApiKey:  " . $apiKey);
    log_debug("Referer: " . $referer);

    http_response_code(403);
    echo json_encode(["error" => "Zugriff verweigert"]);
    exit;
}

// 1. Die Parameter-Daten als assoziatives Array (wie ein Objekt)
$parametersData = [
    "jumuahTime"    => $jumuahTime,
    "blinkDuration" => $blinkDurationMinutes,
    "activeAus"     => $activeAus,
    "assrOneHour"   => $assrOneHourAusOpt,
    "middleNight"   => $middleNightOpt,
    "offsetFadjr"   => $offsetFadjr,
    "offsetDuhr"    => $offsetDuhr,
    "offsetAssr"    => $offsetAssr,
    "offsetMaghrib" => $offsetMaghrib,
    "offsetIshaa"   => $offsetIshaa	
];

// 2. In einen JSON-String umwandeln
$jsonString = json_encode($parametersData, JSON_UNESCAPED_UNICODE);
// und zum API-ausgeben
echo $jsonString;

?>
