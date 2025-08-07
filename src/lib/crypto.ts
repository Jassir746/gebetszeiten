
import CryptoJS from 'crypto-js';

// WICHTIG: Dieser Schlüssel muss exakt mit dem in Ihrem PHP-Skript verwendeten Schlüssel übereinstimmen.
const SECRET_KEY = 'ThisIsASecretKeyForAES123456789';

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
    // Schritt 1: Base64-Dekodierung
    const encryptedData = CryptoJS.enc.Base64.parse(encryptedBase64);
    const encryptedHex = encryptedData.toString(CryptoJS.enc.Hex);

    // Schritt 2: Extrahieren des IV (erste 16 Bytes / 32 Hex-Zeichen)
    const ivHex = encryptedHex.substring(0, 32);
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    // Schritt 3: Extrahieren des eigentlichen verschlüsselten Texts
    const ciphertextHex = encryptedHex.substring(32);
    const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex);
    
    // Konvertieren des Schlüssels in ein CryptoJS-Wortarray
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

    // Schritt 4: AES-Entschlüsselung
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any, // Workaround für CryptoJS-Typen
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    // Schritt 5: Konvertieren des entschlüsselten Texts in einen UTF-8-String
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
        throw new Error("Entschlüsselter Text ist leer. Falscher Schlüssel oder beschädigte Daten?");
    }

    return decryptedText;
  } catch (error) {
    console.error("AES Decryption failed:", error);
    throw new Error("Die Daten konnten nicht entschlüsselt werden. Ist der QR-Code gültig?");
  }
}
