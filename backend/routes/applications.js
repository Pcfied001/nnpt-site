const express = require('express');
const router = express.Router();
const { streamSlip, refNumber } = require('../utils/generateSlip');
const secretariatAuth = require('../middleware/secretariatAuth');
const asyncHandler = require('../utils/asyncHandler');
const { sendApplicationConfirmation } = require('../utils/mailer');
const { getDb, nextId, strip } = require('../config/db');
const { enrolFromApplication } = require('../utils/memberStore');

const col = () => getDb().collection('applications');

// list apps, needs login
router.get('/', secretariatAuth, asyncHandler(async (req, res) => {
  const docs = await col().find({}).sort({ id: 1 }).toArray();
  res.json(docs.map(strip));
}));

// public — anyone can submit
router.post('/', asyncHandler(async (req, res) => {
  const {
    applicantType, fullName, email, phone, address, tier, experience,
    serviceNo, rank, command, serviceStatus, occupation, org, sponsor, note
  } = req.body || {};

  if (!fullName || !email || !phone) {
    return res.status(400).json({ error: 'fullName, email, and phone are required' });
  }
  // naval personnel go on the permanent register, so we need to be able to identify them
  if (applicantType !== 'civilian' && (!serviceNo || !String(serviceNo).trim() || !rank || !String(rank).trim())) {
    return res.status(400).json({ error: 'Service number and rank are required for naval personnel' });
  }

  const id = await nextId('applications');
  const newApplication = {
    id,
    submittedAt: new Date().toISOString(),
    applicantType, fullName, email, phone, address, tier, experience,
    serviceNo, rank, command, serviceStatus, occupation, org, sponsor, note,
    status: 'pending',
    cardPrinted: false,
    cardPrintedAt: null
  };
  // the internal slip PDF is drawn on demand from this record (see GET /:id/slip)
  newApplication.slipRef = refNumber(newApplication);
  newApplication.slipGenerated = true;

  // save the application FIRST so nothing the applicant submitted can be lost
  await col().insertOne(Object.assign({}, newApplication));

  const extra = {};

  // naval personnel are also filed on the permanent personnel register (separate from this
  // application list, so the record survives whatever happens to the application)
  if (newApplication.applicantType !== 'civilian') {
    const enrol = await enrolFromApplication(newApplication);
    if (enrol.created || enrol.duplicateOf) extra.memberNo = enrol.memberNo;
    extra.memberEnrolled = !!enrol.created;
    if (enrol.duplicateOf) extra.duplicateOfMemberId = enrol.duplicateOf;
  }

  // this one DOES go to the applicant — just a "we got it" email, unrelated to the slip
  try {
    const mailResult = await sendApplicationConfirmation(newApplication);
    extra.confirmationEmailSent = mailResult.sent;
    if (!mailResult.sent && mailResult.reason) extra.confirmationEmailError = mailResult.reason;
  } catch (err) {
    extra.confirmationEmailSent = false;
    extra.confirmationEmailError = err.message;
  }

  await col().updateOne({ id }, { $set: extra });
  res.status(201).json(Object.assign(newApplication, extra));
}));

// the slip PDF, login required, no link to this anywhere public
router.get('/:id/slip', secretariatAuth, asyncHandler(async (req, res) => {
  const application = strip(await col().findOne({ id: Number(req.params.id) }));
  if (!application) return res.status(404).json({ error: 'Application not found' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="' + refNumber(application).replace(/\//g, '-') + '.pdf"');
  streamSlip(application, res);
}));

// update status / card-printed flag from the admin page
router.patch('/:id', secretariatAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const update = {};
  if (typeof req.body.cardPrinted === 'boolean') {
    update.cardPrinted = req.body.cardPrinted;
    update.cardPrintedAt = req.body.cardPrinted ? new Date().toISOString() : null;
  }
  if (typeof req.body.status === 'string') {
    update.status = req.body.status;
  }
  if (!Object.keys(update).length) return res.status(400).json({ error: 'Nothing to update' });

  const result = await col().findOneAndUpdate({ id }, { $set: update }, { returnDocument: 'after' });
  if (!result) return res.status(404).json({ error: 'Application not found' });
  res.json(strip(result));
}));

module.exports = router;
