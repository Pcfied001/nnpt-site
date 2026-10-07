const express = require('express');
const router = express.Router();
const secretariatAuth = require('../middleware/secretariatAuth');
const asyncHandler = require('../utils/asyncHandler');
const { sendEnquiryConfirmation } = require('../utils/mailer');
const { getDb, nextId, strip } = require('../config/db');

const col = () => getDb().collection('enquiries');

// needs login
router.get('/', secretariatAuth, asyncHandler(async (req, res) => {
  const docs = await col().find({}).sort({ id: 1 }).toArray();
  res.json(docs.map(strip));
}));

// public
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  const id = await nextId('enquiries');
  const newEnquiry = {
    id,
    submittedAt: new Date().toISOString(),
    name, email, subject, message,
    status: 'unread'
  };
  await col().insertOne(Object.assign({}, newEnquiry));

  // fire off a "got it" email, fails quietly if SMTP isn't set up
  const extra = {};
  try {
    const mailResult = await sendEnquiryConfirmation(newEnquiry);
    extra.confirmationEmailSent = mailResult.sent;
    if (!mailResult.sent && mailResult.reason) extra.confirmationEmailError = mailResult.reason;
  } catch (err) {
    extra.confirmationEmailSent = false;
    extra.confirmationEmailError = err.message;
  }
  await col().updateOne({ id }, { $set: extra });
  res.status(201).json(Object.assign(newEnquiry, extra));
}));

module.exports = router;
