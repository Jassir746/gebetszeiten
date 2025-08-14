<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    $stmt = $pdo->query("SELECT DISTINCT YEAR(Hijri_Date) AS jahr FROM $table ORDER BY jahr ASC");

    $jahre = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $jahre[] = (int)$row['jahr'];
    }

    header('Content-Type: application/json');
    echo json_encode($jahre);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Fehler beim Datenbankzugriff"]);
}

?>
