const nodemailer = require('nodemailer');
const path = require('path');

const CREST_PATH = path.join(__dirname, '..', 'assets', 'nn-crest.png');

// confirmation emails to applicants/enquirers, not the internal slip.
// needs SMTP_HOST/USER/PASS in .env or it just no-ops (see .env.example)

let transporter = null;
let warned = false;

function isConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    family: 4
  });
  return transporter;
}

function warnIfNotConfigured() {
  if (warned || isConfigured()) return;
  console.warn(
    '\n[NNPT] SMTP not configured, skipping confirmation emails. ' +
    'Add SMTP_HOST/SMTP_USER/SMTP_PASS to .env if you want this on.\n'
  );
  warned = true;
}

const FROM_NAME = 'Nigerian Navy Polo Team';

async function sendMail({ to, subject, html, text }) {
  if (!isConfigured()) {
    warnIfNotConfigured();
    return { sent: false, reason: 'not_configured' };
  }
  try {
    await getTransporter().sendMail({
      from: `"${FROM_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
      attachments: [{
        filename: 'nn-crest.png',
        path: CREST_PATH,
        cid: 'nncrest' // used as src="cid:nncrest" below
      }]
    });
    return { sent: true };
  } catch (err) {
    console.error('[NNPT] Failed to send confirmation email to', to, '—', err.message);
    return { sent: false, reason: err.message };
  }
}

function sendEnquiryConfirmation(enquiry) {
  const subject = 'We\'ve received your enquiry — Nigerian Navy Polo Team';
  const text =
    `Hi ${enquiry.name || 'there'},\n\n` +
    `Thanks for reaching out to the Nigerian Navy Polo Team. We've received your enquiry and a member ` +
    `of the secretariat will get back to you within 3–5 working days.\n\n` +
    `Your message:\n"${enquiry.message}"\n\n` +
    `— Nigerian Navy Polo Team Secretariat`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; max-width:520px; margin:0 auto; color:#142A44;">
      <div style="background:#0B1E33; padding:24px 28px; text-align:center;">
        <img src="cid:nncrest" alt="Nigerian Navy Crest" width="56" height="56" style="display:block; margin:0 auto 12px;">
        <p style="color:#C6A15B; font-size:12px; letter-spacing:1px; text-transform:uppercase; margin:0 0 6px;">Nigerian Navy Polo Team</p>
        <h1 style="color:#EFE9DC; font-size:20px; margin:0;">Enquiry Received</h1>
      </div>
      <div style="padding:28px; border:1px solid #eee; border-top:none;">
        <p>Hi ${escapeHtml(enquiry.name || 'there')},</p>
        <p>Thanks for reaching out to the Nigerian Navy Polo Team. We've received your enquiry and a member of the secretariat will get back to you within 3–5 working days.</p>
        <p style="background:#F8F6F1; border-left:3px solid #C6A15B; padding:12px 16px; color:#5B6B7A; font-style:italic;">
          "${escapeHtml(enquiry.message || '')}"
        </p>
        <p style="margin-top:28px; color:#5B6B7A; font-size:13px;">— Nigerian Navy Polo Team Secretariat</p>
      </div>
    </div>`;

  return sendMail({ to: enquiry.email, subject, html, text });
}

function sendApplicationConfirmation(application) {
  const subject = 'Your membership application has been received — Nigerian Navy Polo Team';
  const text =
    `Hi ${application.fullName || 'there'},\n\n` +
    `Thank you for applying for membership with the Nigerian Navy Polo Team. We've received your application ` +
    `and the secretariat will review it and be in touch within 5–7 working days.\n\n` +
    `— Nigerian Navy Polo Team Secretariat`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; max-width:520px; margin:0 auto; color:#142A44;">
      <div style="background:#0B1E33; padding:24px 28px; text-align:center;">
        <img src="cid:nncrest" alt="Nigerian Navy Crest" width="56" height="56" style="display:block; margin:0 auto 12px;">
        <p style="color:#C6A15B; font-size:12px; letter-spacing:1px; text-transform:uppercase; margin:0 0 6px;">Nigerian Navy Polo Team</p>
        <h1 style="color:#EFE9DC; font-size:20px; margin:0;">Application Received</h1>
      </div>
      <div style="padding:28px; border:1px solid #eee; border-top:none;">
        <p>Hi ${escapeHtml(application.fullName || 'there')},</p>
        <p>Thank you for applying for membership with the Nigerian Navy Polo Team. We've received your application and the secretariat will review it and be in touch within 5–7 working days.</p>
        <p style="margin-top:28px; color:#5B6B7A; font-size:13px;">— Nigerian Navy Polo Team Secretariat</p>
      </div>
    </div>`;

  return sendMail({ to: application.email, subject, html, text });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

module.exports = { sendEnquiryConfirmation, sendApplicationConfirmation, isConfigured };
