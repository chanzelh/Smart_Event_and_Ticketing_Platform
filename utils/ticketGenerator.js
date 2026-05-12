const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generateTicketPDF(dataCallback, endCallback, ticketData) {
    const colors = {
        surfaceGray: '#2A2A2A',
        secondaryGray: '#444444',
        deepCharcoal: '#121212', 
        textWhite: '#FFFFFF'
    };

    // 1. Generate the QR Code Data URL first
    // We can encode the Order ID or a unique URL
    const qrData = `https://tckt.system/verify/${ticketData.orderId || 'DEMO123'}`;
    const qrImageURL = await QRCode.toDataURL(qrData);

    const doc = new PDFDocument({ 
        size: [650, 300], 
        margin: 0 
    });

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    // --- DRAWING SECTION ---

    // Main Container
    doc.fillColor(colors.surfaceGray)
       .roundedRect(25, 25, 600, 250, 20)
       .fill()
       .lineWidth(1)
       .strokeColor(colors.secondaryGray)
       .stroke();

    // Punched Holes
    doc.fillColor(colors.deepCharcoal)
       .circle(25, 150, 15).fill()
       .circle(625, 150, 15).fill();

    // Dashed Header Line
    doc.moveTo(50, 100)
       .lineTo(600, 100)
       .dash(5, { space: 5 })
       .strokeColor(colors.secondaryGray)
       .stroke();

    doc.undash();

    // Text Content
    doc.fillColor(colors.textWhite)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('Tckt.', 50, 50);

    doc.fontSize(18).text(ticketData.eventName, 50, 120);
    doc.fontSize(12).fillColor('#AAAAAA')
       .text(`Attendee: ${ticketData.userName}`, 50, 150)
       .text(`Date: ${ticketData.eventDate}`, 50, 170);

    // 2. Draw the actual QR Code
    const qrSize = 80;
    const qrX = 520;
    const qrY = 135;

    // Background for QR
    doc.fillColor('#FFFFFF') // QR codes need high contrast (white bg)
       .roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 8)
       .fill();

    // The QR Image itself
    doc.image(qrImageURL, qrX, qrY, { width: qrSize });

    doc.fillColor(colors.textWhite)
       .fontSize(7)
       .text('SCAN TO VERIFY', qrX - 5, qrY + qrSize + 10, { width: qrSize + 10, align: 'center' });

    doc.end();
}

module.exports = { generateTicketPDF };