const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const NAVY = '#0B1E33';
const GOLD = '#C6A15B';
const OXBLOOD = '#7B2D26';
const INK = '#142A44';
const MIST = '#5B6B7A';

const SLIPS_DIR = path.join(__dirname, '..', 'data', 'slips');
if (!fs.existsSync(SLIPS_DIR)) fs.mkdirSync(SLIPS_DIR, { recursive: true });

function refNumber(application) {
  var prefix = application.applicantType === 'civilian' ? 'NNPT/CIV' : 'NNPT/NP';
  var padded = String(application.id).padStart(5, '0');
  var year = new Date(application.submittedAt).getFullYear();
  return prefix + '/' + year + '/' + padded;
}

function row(doc, x, y, label, value) {
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MIST)
    .text(label.toUpperCase(), x, y, { characterSpacing: 0.6 });
  doc.font('Helvetica').fontSize(11.5).fillColor(INK)
    .text(value && String(value).trim() ? value : '—', x, y + 13, { width: 250 });
}

// builds the internal premium slip PDF, saves to data/slips/{id}.pdf
// internal only — never gets emailed to the applicant, secretariat has to issue it manually
function generateSlip(application) {
  const isCivilian = application.applicantType === 'civilian';
  const filePath = path.join(SLIPS_DIR, application.id + '.pdf');

  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const pageW = doc.page.width;
  const marginX = 54;
  const contentW = pageW - marginX * 2;
  const crestPath = path.join(__dirname, '..', 'assets', 'nn-crest.png');

  // ---- Header band ----
  doc.rect(0, 0, pageW, 118).fill(NAVY);

  if (fs.existsSync(crestPath)) {
    const crestH = 88;
    const crestW = crestH * (148 / 200);
    doc.image(crestPath, pageW - marginX - crestW, 15, { height: crestH });
  }

  doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(9)
    .text('NIGERIAN NAVY POLO TEAM', marginX, 34, { characterSpacing: 1.2 });
  doc.fillColor('#EFE9DC').font('Helvetica-Bold').fontSize(20)
    .text('Membership Premium Slip', marginX, 50);
  doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(9.5)
    .text(isCivilian ? 'CIVILIAN APPLICANT' : 'NAVAL PERSONNEL (SERVING OR RETIRED)', marginX, 82, { characterSpacing: 1 });

  doc.fillColor('#EFE9DC').font('Helvetica').fontSize(9)
    .text('Reference: ' + refNumber(application), marginX, 96);

  // Internal-use watermark banner
  doc.rect(0, 118, pageW, 26).fill(OXBLOOD);
  doc.fillColor('#F4E9E8').font('Helvetica-Bold').fontSize(8.5)
    .text('INTERNAL USE ONLY — NOT TO BE ISSUED TO APPLICANT WITHOUT SECRETARIAT APPROVAL', marginX, 127, { characterSpacing: 0.4 });

  let y = 168;

  // ---- Applicant details ----
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(12).text('Applicant Details', marginX, y);
  y += 22;

  const colW = contentW / 2;
  row(doc, marginX, y, 'Full Name', application.fullName);
  row(doc, marginX + colW, y, 'Membership Tier', application.tier);
  y += 40;

  row(doc, marginX, y, 'Email Address', application.email);
  row(doc, marginX + colW, y, 'Phone Number', application.phone);
  y += 40;

  row(doc, marginX, y, 'Address', application.address);
  row(doc, marginX + colW, y, 'Polo Experience', application.experience);
  y += 40;

  if (isCivilian) {
    row(doc, marginX, y, 'Occupation', application.occupation);
    row(doc, marginX + colW, y, 'Organisation', application.org);
    y += 40;
    row(doc, marginX, y, 'Referee / Sponsor', application.sponsor);
    y += 40;
  } else {
    row(doc, marginX, y, 'Service Number', application.serviceNo);
    row(doc, marginX + colW, y, 'Rank', application.rank);
    y += 40;
    row(doc, marginX, y, 'Command / Unit', application.command);
    y += 40;
  }

  y += 8;
  doc.moveTo(marginX, y).lineTo(pageW - marginX, y).lineWidth(0.75).strokeColor('#D8D2C4').stroke();
  y += 26;

  // ---- Premium section ----
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(12).text('Membership Premium', marginX, y);
  y += 24;

  doc.rect(marginX, y, contentW, 64).fillAndStroke('#F8F6F1', '#D8D2C4');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MIST)
    .text('AMOUNT PAYABLE', marginX + 16, y + 12, { characterSpacing: 0.6 });
  doc.font('Helvetica-Bold').fontSize(15).fillColor(OXBLOOD)
    .text('To be confirmed by the Secretariat', marginX + 16, y + 28);
  doc.font('Helvetica').fontSize(8.5).fillColor(MIST)
    .text('Premium schedule has not yet been finalised for this membership tier.', marginX + 16, y + 46);
  y += 64 + 22;

  row(doc, marginX, y, 'Payment Reference', '');
  row(doc, marginX + colW, y, 'Date Paid', '');
  y += 40;

  row(doc, marginX, y, 'Received By', '');
  row(doc, marginX + colW, y, 'Status', 'PENDING REVIEW');
  y += 50;

  doc.moveTo(marginX, y).lineTo(pageW - marginX, y).lineWidth(0.75).strokeColor('#D8D2C4').stroke();
  y += 20;

  doc.font('Helvetica').fontSize(9).fillColor(MIST)
    .text('Application submitted: ' + new Date(application.submittedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }), marginX, y);

  // Footer
  const footerY = doc.page.height - 46;
  doc.moveTo(marginX, footerY).lineTo(pageW - marginX, footerY).lineWidth(0.75).strokeColor('#D8D2C4').stroke();
  doc.font('Helvetica').fontSize(8).fillColor(MIST)
    .text('Nigerian Navy Polo Team · Secretariat Document · ' + refNumber(application), marginX, footerY + 10);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { generateSlip, refNumber };
