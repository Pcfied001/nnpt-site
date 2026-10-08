const express = require('express');
const router = express.Router();
const { streamSlip, refNumber } = require('../utils/generateSlip');
const secretariatAuth = require('../middleware/secretariatAuth');
const asyncHandler = require('../utils/asyncHandler');
const { sendApplicationConfirmation } = require('../utils/mailer');
const { getDb, nextId, strip } = require('../config/db');
const { enrolFromApplication } = require('../utils/memberStore');
const { validateApplication } = require('../utils/validateApplication');

const col = () => getDb().collection('applications');

// the photo is a ~150 KB base64 string — never send it in JSON; it has its own endpoint
function withoutPhoto(doc) {
  if (!doc) return doc;
  const { photo, ...rest } = strip(doc);
  return rest;
}

// list apps, needs login
router.get('/', secretariatAuth, asyncHandler(async (req, res) => {
  const docs = await col().find({}, { projection: { photo: 0 } }).sort({ id: 1 }).toArray();
  res.json(docs.map(strip));
}));

// public — anyone can submit
router.post('/', asyncHandler(async (req, res) => {
  // every field is mandatory (naval-personnel or civilian set, depending on type), plus the photo
  const { errors, values } = validateApplication(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({
      error: 'Please complete every required field. Missing or invalid: ' + Object.keys(errors).join(', ') + '.',
      fields: errors
    });
  }
  const {
    applicantType, fullName, email, phone, address, dateOfBirth, sex, tier, experience,
    serviceNo, rank, command, serviceStatus, occupation, org, sponsor, note, photo
  } = values;

  const id = await nextId('applications');
  const newApplication = {
    id,
    submittedAt: new Date().toISOString(),
    applicantType, fullName, email, phone, address, dateOfBirth, sex, tier, experience,
    serviceNo, rank, command, serviceStatus, occupation, org, sponsor, note,
    photo,            // base64 JPEG — the slip PDF prints this automatically
    hasPhoto: true,
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
  res.status(201).json(Object.assign(withoutPhoto(newApplication), extra));
}));

// the applicant's photo as an image, login required
router.get('/:id/photo', secretariatAuth, asyncHandler(async (req, res) => {
  const doc = await col().findOne({ id: Number(req.params.id) }, { projection: { photo: 1 } });
  if (!doc || !doc.photo) return res.status(404).json({ error: 'No photo on file for this application' });
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.send(Buffer.from(doc.photo, 'base64'));
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
  res.json(withoutPhoto(result));
}));

// permanently remove an application (admin only). Naval personnel who were already filed on the
// personnel register stay there — the register is permanent and is managed from its own tab.
router.delete('/:id', secretariatAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const result = await col().deleteOne({ id });
  if (!result.deletedCount) return res.status(404).json({ error: 'Application not found' });
  res.json({ deleted: true, id });
}));

module.exports = router;
