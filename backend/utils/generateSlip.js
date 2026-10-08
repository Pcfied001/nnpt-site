const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const NAVY = '#0B1E33';
const GOLD = '#C6A15B';
const OXBLOOD = '#7B2D26';
const INK = '#142A44';
const MIST = '#5B6B7A';


function refNumber(application) {
  var prefix = application.applicantType === 'civilian' ? 'NNPA/CIV' : 'NNPA/NP';
  var padded = String(application.id).padStart(5, '0');
  var year = new Date(application.submittedAt).getFullYear();
  return prefix + '/' + year + '/' + padded;
}

function row(doc, x, y, label, value, width) {
  width = width || 250;
  const text = value && String(value).trim() ? String(value) : '—';
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MIST)
    .text(label.toUpperCase(), x, y, { characterSpacing: 0.6, width: width, lineBreak: false });
  // shrink long values (down to 8pt) so they stay on one line inside their column
  doc.font('Helvetica');
  let size = 11.5;
  while (size > 8 && doc.fontSize(size).widthOfString(text) > width) size -= 0.5;
  doc.fontSize(size).fillColor(INK)
    .text(text, x, y + 13, { width: width, lineBreak: false, ellipsis: true });
}

function formatDob(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// the applicant's passport photo, cropped to fill the frame (same 4:5 crop the form previews).
// applications made before photos were collected get a clearly-marked empty frame instead.
function drawPhoto(doc, application, x, y, w, h) {
  let drawn = false;
  if (application.photo) {
    try {
      doc.save();
      doc.rect(x, y, w, h).clip();      // 'cover' scales to fill but doesn't crop, so clip to the frame
      doc.image(Buffer.from(application.photo, 'base64'), x, y, { cover: [w, h], align: 'center', valign: 'center' });
      doc.restore();
      drawn = true;
    } catch (err) {
      doc.restore();
      console.error('Could not draw photo on slip for application', application.id, err.message);
    }
  }
  if (!drawn) {
    doc.rect(x, y, w, h).fill('#F8F6F1');
    doc.rect(x + 0.5, y + 0.5, w - 1, h - 1).dash(3, { space: 3 }).lineWidth(0.75).strokeColor('#B9B2A0').stroke().undash();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MIST)
      .text('NO PHOTO', x, y + h / 2 - 9, { width: w, align: 'center', characterSpacing: 0.6, lineBreak: false });
    doc.text('ON FILE', x, y + h / 2 + 2, { width: w, align: 'center', characterSpacing: 0.6, lineBreak: false });
  }
  doc.rect(x - 1.5, y - 1.5, w + 3, h + 3).lineWidth(1.5).strokeColor(GOLD).stroke();
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

  // passport photo sits top-right of the details; the first four rows run down its left side
  const photoW = 108, photoH = 135;
  const photoX = pageW - marginX - photoW;
  drawPhoto(doc, application, photoX, y, photoW, photoH);

  const c1 = marginX, c1W = 190;
  const c2 = marginX + 205, c2W = photoX - 14 - c2;
  const rowH = 34;

  row(doc, c1, y, 'Full Name', application.fullName, c1W);
  row(doc, c2, y, 'Membership Tier', application.tier, c2W);
  y += rowH;

  row(doc, c1, y, 'Date of Birth', formatDob(application.dateOfBirth), c1W);
  row(doc, c2, y, 'Sex', application.sex, c2W);
  y += rowH;

  row(doc, c1, y, 'Email Address', application.email, c1W);
  row(doc, c2, y, 'Phone Number', application.phone, c2W);
  y += rowH;

  if (isCivilian) {
    row(doc, c1, y, 'Occupation', application.occupation, c1W);
    row(doc, c2, y, 'Organisation', application.org, c2W);
  } else {
    row(doc, c1, y, 'Service Number', application.serviceNo, c1W);
    row(doc, c2, y, 'Rank', application.rank, c2W);
  }
  y += rowH;

  // below the photo: full-width rows
  y += photoH - rowH * 4 + 16;

  row(doc, marginX, y, 'Address', application.address, contentW);
  y += 40;

  if (isCivilian) {
    row(doc, marginX, y, 'Referee / Sponsor', application.sponsor, colW - 12);
    row(doc, marginX + colW, y, 'Polo Experience', application.experience, colW - 12);
    y += 40;
  } else {
    const statusLabel = application.serviceStatus === 'retired' ? 'Retired' : (application.serviceStatus === 'serving' ? 'Serving' : '');
    row(doc, marginX, y, 'Command / Unit', application.command, colW - 12);
    row(doc, marginX + colW, y, 'Service Status', statusLabel, colW - 12);
    y += 40;
    row(doc, marginX, y, 'Polo Experience', application.experience, colW - 12);
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
