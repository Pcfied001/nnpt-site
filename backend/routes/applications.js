const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { generateSlip, refNumber } = require('../utils/generateSlip');
const secretariatAuth = require('../middleware/secretariatAuth');
const { sendApplicationConfirmation } = require('../utils/mailer');

const dataPath = path.join(__dirname, '..', 'data', 'applications.json');

function readApplications() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return raw ? JSON.parse(raw) : [];
}

function writeApplications(applications) {
  fs.writeFileSync(dataPath, JSON.stringify(applications, null, 2));
}

// list apps, needs login
router.get('/', secretariatAuth, (req, res) => {
  res.json(readApplications());
});

// public — anyone can submit
router.post('/', async (req, res) => {
  const {
    applicantType, fullName, email, phone, address, tier, experience,
    serviceNo, rank, command, occupation, org, sponsor, note
  } = req.body;

  if (!fullName || !email || !phone) {
    return res.status(400).json({ error: 'fullName, email, and phone are required' });
  }

  const applications = readApplications();
  const nextId = applications.length ? Math.max(...applications.map((a) => a.id)) + 1 : 1;
  const newApplication = {
    id: nextId,
    submittedAt: new Date().toISOString(),
    applicantType, fullName, email, phone, address, tier, experience,
    serviceNo, rank, command, occupation, org, sponsor, note,
    status: 'pending',
    cardPrinted: false,
    cardPrintedAt: null
  };

  applications.push(newApplication);

  // generate the internal slip (civilian/naval template picked by applicantType)
  // internal only, never goes to the applicant
  try {
    await generateSlip(newApplication);
    newApplication.slipRef = refNumber(newApplication);
    newApplication.slipGenerated = true;
  } catch (err) {
    newApplication.slipGenerated = false;
    console.error('Slip generation failed for application', newApplication.id, err);
  }

  // this one DOES go to the applicant — just a "we got it" email, unrelated to the slip above
  const mailResult = await sendApplicationConfirmation(newApplication);
  newApplication.confirmationEmailSent = mailResult.sent;
  if (!mailResult.sent && mailResult.reason) {
    newApplication.confirmationEmailError = mailResult.reason;
  }

  writeApplications(applications);
  res.status(201).json(newApplication);
});

// download the slip pdf, login required, no link to this anywhere public
router.get('/:id/slip', secretariatAuth, (req, res) => {
  const id = Number(req.params.id);
  const applications = readApplications();
  const application = applications.find((a) => a.id === id);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  const slipPath = path.join(__dirname, '..', 'data', 'slips', id + '.pdf');
  if (!fs.existsSync(slipPath)) {
    return res.status(404).json({ error: 'Slip not yet generated for this application' });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="' + refNumber(application).replace(/\//g, '-') + '.pdf"');
  fs.createReadStream(slipPath).pipe(res);
});

// update status / card-printed flag from the admin page
router.patch('/:id', secretariatAuth, (req, res) => {
  const id = Number(req.params.id);
  const applications = readApplications();
  const application = applications.find((a) => a.id === id);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  if (typeof req.body.cardPrinted === 'boolean') {
    application.cardPrinted = req.body.cardPrinted;
    application.cardPrintedAt = req.body.cardPrinted ? new Date().toISOString() : null;
  }
  if (typeof req.body.status === 'string') {
    application.status = req.body.status;
  }

  writeApplications(applications);
  res.json(application);
});

module.exports = router;
