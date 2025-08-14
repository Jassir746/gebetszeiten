<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

// Danach: Input-Validation ...
if (!isset($_GET['year']) || !preg_match('/^\d{4}$/', $_GET['year'])) {
    http_response_code(400);
    echo json_encode(["error" => "Ungültiges Jahr"]);
    exit;
}

// ----------- connect to database -----------
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["error" => "DB-Verbindung fehlgeschlagen"]);
    exit;
}
$conn->set_charset("utf8");

// ----------- Jahr ermitteln -----------
$year = isset($_GET['year']) ? intval($_GET['year']) : date("Y");

// ----------- Daten abrufen ----------- FROM $table (siehe: db_config.php)
$sql = "SELECT Gregorian_Date, Hijri_Date, Fadjr, Shuruk, Duhr, Assr, Maghrib, Ishaa FROM $table 
        WHERE YEAR(Gregorian_Date) = $year 
        ORDER BY Gregorian_Date ASC";

$result = $conn->query($sql);
$data = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $datum = $row['Gregorian_Date'];  // z.B. 2025-06-15
        $yearKey = substr($datum, 0, 4);  // extrahiere: "2025"

        unset($row['Gregorian_Date']);

        if (!isset($data[$yearKey])) {
            $data[$yearKey] = [];
        }
        $data[$yearKey][$datum] = $row;
    }
}

//--- Zu DEBUG-Zwecken einbauen in load_prayer_times.php: ---
// file_put_contents("debug_output.json", json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode($data, JSON_UNESCAPED_UNICODE);
$conn->close();
?>
