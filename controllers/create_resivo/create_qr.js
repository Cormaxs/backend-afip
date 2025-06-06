import qrcode from 'qrcode';
import fs from 'fs';

export async function generateQrCodeBase64(url, outputPath = null) {
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(url, {
      errorCorrectionLevel: 'H', // Alto nivel de corrección de error
      width: 200, // Ancho de la imagen del QR en píxeles
      margin: 1 // Margen alrededor del QR
    });

    // Si se proporciona una ruta de salida, guarda el QR como un archivo PNG
    if (outputPath) {
      // Extrae solo los datos Base64 de la Data URL (quitando 'data:image/png;base64,')
      const base64Data = qrCodeDataUrl.split(';base64,').pop();
      fs.writeFileSync(outputPath, base64Data, { encoding: 'base64' });
      console.log(`QR guardado como PNG en: ${outputPath}`);
    }

    return qrCodeDataUrl; // Devuelve la Data URL completa
  } catch (err) {
    console.error('Error al generar el QR:', err);
    throw err;
  }
}

// --- Ejemplo de uso ---
/*
(async () => {
  const urlToEncode = 'https://google.com/';
  const outputPngPath = './google_qr.png'; // Ruta para guardar el QR como PNG

  try {
    const qrBase64 = await generateQrCodeBase64(urlToEncode, outputPngPath);
    console.log('\nQR Base64 generado (primera parte):', qrBase64.substring(0, 100) + '...');
    // El QR Base64 completo es lo que usarías en pdfmake
  } catch (error) {
    console.error('Fallo al generar el QR de ejemplo:', error);
  }
})();
 */