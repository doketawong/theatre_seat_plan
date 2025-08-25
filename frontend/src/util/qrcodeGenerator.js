// QR Code generator utility
// Usage: generateQRCode(participantInfo)
import QRCode from 'qrcode';

/**
 * Generates a QR code data URL containing participant info
 * @param {Object} participantInfo - { name, email, seat, event, ticketId, timestamp }
 * @returns {Promise<string>} - QR code image data URL
 */
export async function generateQRCode(participantInfo) {
  const data = JSON.stringify({
    ...participantInfo,
    generatedAt: new Date().toISOString(),
    type: 'event-ticket'
  });
  
  try {
    return await QRCode.toDataURL(data, { 
      errorCorrectionLevel: 'H', 
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
}

/**
 * Generates a downloadable QR code as blob
 * @param {Object} participantInfo - Participant information
 * @returns {Promise<Blob>} - QR code as blob for download
 */
export async function generateQRCodeBlob(participantInfo) {
  try {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, JSON.stringify(participantInfo), {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2
    });
    
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
  } catch (err) {
    console.error('QR code blob generation failed:', err);
    return null;
  }
}
