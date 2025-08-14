
<?php
// WICHTIG: Erst die Konfiguration laden
require_once  $_SERVER['DOCUMENT_ROOT'] . '/includes/db_config.php';

// -----------------------------------------------------------------------
//
// https://zero-clue.de/as-salah/utils/encryption.php
//
// #######################################################################
// 1. Datenverschlüsselung:
// Hier wird der OpenSSL-Verschlüsselungsalgorithmus AES verwendet.

$QR_BASEDIR = dirname(__FILE__).DIRECTORY_SEPARATOR;

function encryptData($data, $key) {
  $ivLength = openssl_cipher_iv_length('aes-256-cbc');
  $iv = openssl_random_pseudo_bytes($ivLength);
  $encrypted = openssl_encrypt($data, 'aes-256-cbc', $key, 0, $iv);
  return base64_encode($iv . $encrypted);
}

// --------- Datenverschlüsselung vorbereiten:
// 1. Die Daten als assoziatives Array (wie ein Objekt)
$configData = [
    "alias"     => $standortAlias,
    "serverUrl" => "https://" . $anwenderDomain . "/" . $anwenderSubdir . "/",
    "apiKey"    => $validApiKey                      // API-Key (aus db_config.php Datei )
];

// 2. In einen JSON-String umwandeln
$jsonString = json_encode($configData);

// 3. Diesen JSON-String verschlüsseln
// Encryption-Key ist im db_config-File gespeichert und wird von dort geladen)

// ---------- zu verschlüsselnde Informationen in $jsonString
$encryptedData = encryptData($jsonString, $encryptionKey); // Ihre encryptData Funktion

// ---------- Datenausgabe zurt Kontrolle
echo "Verschlüsselte Daten: " . $encryptedData . "\n";

// ---------- QR-Code generieren
require_once  $QR_BASEDIR."genqrcode.php";

?>
