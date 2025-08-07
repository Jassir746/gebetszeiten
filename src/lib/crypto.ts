
import CryptoJS from 'crypto-js';

// WICHTIG: Dieser Schlüssel muss exakt 32 Zeichen lang sein und mit dem im PHP-Skript verwendeten Schlüssel übereinstimmen.
const SECRET_KEY = 'ThisIsASecretKeyForAES12345678';

/**
 * Entschlüsselt einen mit OpenSSL (AES-256-CBC) verschlüsselten und Base64-kodierten String.
 * Erwartet, dass der verschlüsselte Text das IV als erste 16 Bytes enthält.
 * 
 * @param encryptedBase64 Der verschlüsselte, Base64-kodierte String aus dem QR-Code.
 * @returns Der entschlüsselte Klartext.
 * @throws Wirft einen Fehler, wenn die Entschlüsselung fehlschlägt.
 */
export function decryptData(encryptedBase64: string): string {
  try {
    // Schritt 1: Base64-Dekodierung des gesamten Payloads
    const encryptedDataWithIv = CryptoJS.enc.Base64.parse(encryptedBase64);
    const encryptedHex = encryptedDataWithIv.toString(CryptoJS.enc.Hex);

    // Schritt 2: Extrahieren des IV (erste 16 Bytes = 32 Hex-Zeichen)
    const ivHex = encryptedHex.substring(0, 32);
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    // Schritt 3: Extrahieren des eigentlichen verschlüsselten Texts (der Rest des Payloads)
    const ciphertextHex = encryptedHex.substring(32);
    const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex);
    
    // Den geheimen Schlüssel in ein für CryptoJS verständliches Format bringen
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

    // Schritt 4: AES-Entschlüsselung mit AES-256-CBC
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any, // Ein Workaround für die Typdefinition von crypto-js
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    // Schritt 5: Konvertieren des entschlüsselten Texts in einen lesbaren UTF-8-String
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
        throw new Error("Entschlüsselter Text ist leer. Möglicherweise ist der Schlüssel falsch oder die Daten sind beschädigt.");
    }

    return decryptedText;
  } catch (error) {
    console.error("AES Decryption failed:", error);
    throw new Error("Die Daten aus dem QR-Code konnten nicht entschlüsselt werden. Ist der Code gültig und der Schlüssel korrekt?");
  }
}
