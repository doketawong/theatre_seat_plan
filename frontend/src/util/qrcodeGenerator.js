// QR Code generator utility
// Usage: generateQRCode(participantInfo)
import QRCode from 'qrcode';

/**
 * Generates a QR code data URL containing participant info
 * @param {Object} participantInfo - { name, email, seat, event, ticketId, timestamp }
 * @param {Object} options - QR code styling options
 * @returns {Promise<string>} - QR code image data URL
 */
export async function generateQRCode(participantInfo, options = {}) {
  const data = JSON.stringify({
    ...participantInfo,
    generatedAt: new Date().toISOString(),
    type: 'event-ticket'
  });
  
  const defaultOptions = {
    errorCorrectionLevel: 'H', 
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };
  
  const qrOptions = { ...defaultOptions, ...options };
  
  try {
    return await QRCode.toDataURL(data, qrOptions);
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
