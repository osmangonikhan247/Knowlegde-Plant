const QRCode = require('qrcode');

// Save as PNG file
QRCode.toFile( 'qrcode-ym.png','https://www.youtube.com', {
    color: {
        dark: '#021735',   // QR code color
        light: '#ffffff'   // Background color
    },
    width: 200,
    margin: 2
}, function(err) {
    if (err) {
        console.log('Error:', err);
        return;
    }
    console.log('QR Code saved as qrcode.png');
});