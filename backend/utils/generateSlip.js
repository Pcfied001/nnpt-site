const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const NAVY = '#0B1E33';
const GOLD = '#C6A15B';
const OXBLOOD = '#7B2D26';
const INK = '#142A44';
const MIST = '#5B6B7A';


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

// draws the internal premium slip PDF straight into `outStream` (e.g. the HTTP response).
// slips are built on demand from the saved application, so no PDF files need to be stored.
// internal only — never gets emailed to the applicant, secretariat has to issue it manually
function streamSlip(application, outStream) {
  const isCivilian = application.applicantType === 'civilian';

  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.pipe(outStream);

  const pageW = doc.page.width;
  const marginX = 54;
  const contentW = pageW - marginX * 2;
  const navyCrestPath = path.join(__dirname, '..', 'assets', 'nn-crest.png');
  const poloLogoPath = path.join(__dirname, '..', 'assets', 'logo-npa.png');

  // ---- Header band ----
  doc.rect(0, 0, pageW, 118).fill(NAVY);

  const logoH = 88;
  const logoY = 15;
  // left: Nigerian Navy crest (portrait, 148 x 200)
  const navyW = logoH * (148 / 200);
  const textX = marginX + navyW + 18;
  if (fs.existsSync(navyCrestPath)) {
    doc.image(navyCrestPath, marginX, logoY, { height: logoH });
  }
  // right: Nigerian Navy Polo Association logo (square)
  if (fs.existsSync(poloLogoPath)) {
    doc.image(poloLogoPath, pageW - marginX - logoH, logoY, { height: logoH });
  }

  const textW = pageW - marginX - logoH - 18 - textX;
  doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(9)
    .text('NIGERIAN NAVY POLO ASSOCIATION', textX, 34, { characterSpacing: 1.2, width: textW, lineBreak: false });
  doc.fillColor('#EFE9DC').font('Helvetica-Bold').fontSize(20)
    .text('Membership Premium Slip', textX, 50, { width: textW, lineBreak: false });
  doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(9.5)
    .text(isCivilian ? 'CIVILIAN APPLICANT' : 'NAVAL PERSONNEL (SERVING OR RETIRED)', textX, 82, { characterSpacing: 1, width: textW, lineBreak: false });

  doc.fillColor('#EFE9DC').font('Helvetica').fontSize(9)
    .text('Reference: ' + refNumber(application), textX, 96, { width: textW, lineBreak: false });

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
    .text('Nigerian Navy Polo Association · Secretariat Document · ' + refNumber(application), marginX, footerY + 10);

  doc.end();
}

module.exports = { streamSlip, refNumber };
