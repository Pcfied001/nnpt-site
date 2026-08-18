const path = require('path');
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const CREST_URL = process.env.PUBLIC_SITE_URL
  ? `${process.env.PUBLIC_SITE_URL.replace(/\/$/, '')}/assets/nn-crest.png`
  : '/assets/nn-crest.png';

let warned = false;

function isConfigured() {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL);
}

function warnIfNotConfigured() {
  if (warned || isConfigured()) return;
  console.warn(
    '\n[NNPT] Brevo not configured, skipping confirmation emails. ' +
    'Add BREVO_API_KEY/BREVO_FROM_EMAIL to .env if you want this on.\n'
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
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: process.env.BREVO_FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text
      })
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`Brevo API ${res.status}: ${errBody}`);
    }

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
        <img src="${CREST_URL}" alt="Nigerian Navy Crest" width="56" height="56" style="display:block; margin:0 auto 12px;">
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
        <img src="${CREST_URL}" alt="Nigerian Navy Crest" width="56" height="56" style="display:block; margin:0 auto 12px;">
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