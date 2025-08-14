
<?php
// #######################################################################
// 2. QR-Code-Generierung:
// Es wird die Bibliothek phpqrcode verwendet, die hier als Beispiel dient. 
// Es gibt auch andere Bibliotheken, wie z.B. 
// [Link: QRCode Chimp https://de.qrcodechimp.com/10-free-qr-code-generators/], 
// die verwendet werden können. 

$QR_BASEDIR = dirname(__FILE__).DIRECTORY_SEPARATOR;

include $QR_BASEDIR."phpqrcode/qrlib.php"; // Pfad zur qrlib.php anpassen

$data = $encryptedData;
$filename = 'verschluesselter_qr_code.png';
$errorCorrectionLevel = 'L'; // Fehlerkorrekturlevel (L, M, Q, H)
$matrixPointSize = 4; // Punktgröße

QRcode::png($data, $filename, $errorCorrectionLevel, $matrixPointSize, 2);

echo 'QR-Code erfolgreich generiert: ' . $filename . "\n";

?>
