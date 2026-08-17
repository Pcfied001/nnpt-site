const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const secretariatAuth = require('../middleware/secretariatAuth');
const { sendEnquiryConfirmation } = require('../utils/mailer');

const dataPath = path.join(__dirname, '..', 'data', 'enquiries.json');

function readEnquiries() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return raw ? JSON.parse(raw) : [];
}

function writeEnquiries(enquiries) {
  fs.writeFileSync(dataPath, JSON.stringify(enquiries, null, 2));
}

// needs login
router.get('/', secretariatAuth, (req, res) => {
  res.json(readEnquiries());
});

// public
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  const enquiries = readEnquiries();
  const nextId = enquiries.length ? Math.max(...enquiries.map((e) => e.id)) + 1 : 1;
  const newEnquiry = {
    id: nextId,
    submittedAt: new Date().toISOString(),
    name, email, subject, message,
    status: 'unread'
  };

  enquiries.push(newEnquiry);

  // fire off a "got it" email, fails quietly if SMTP isn't set up
  const mailResult = await sendEnquiryConfirmation(newEnquiry);
  newEnquiry.confirmationEmailSent = mailResult.sent;
  if (!mailResult.sent && mailResult.reason) {
    newEnquiry.confirmationEmailError = mailResult.reason;
  }

  writeEnquiries(enquiries);
  res.status(201).json(newEnquiry);
});

module.exports = router;
