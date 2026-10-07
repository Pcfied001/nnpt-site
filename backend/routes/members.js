const express = require('express');
const router = express.Router();

const secretariatAuth = require('../middleware/secretariatAuth');
const asyncHandler = require('../utils/asyncHandler');
const { getDb } = require('../config/db');
const { OFFICER_RANKS, RATING_RANKS } = require('../utils/ranks');
const {
  listMembers, getMember, findByServiceNo, createMember, saveMember, withComputed
} = require('../utils/memberStore');

// the whole register is personal data — everything here needs the secretariat login
router.use(secretariatAuth);

const STATUSES = ['pending', 'active', 'suspended', 'archived'];
const EDITABLE = ['fullName', 'serviceNo', 'rank', 'command', 'serviceStatus', 'membershipTier', 'email', 'phone', 'address', 'notes'];

function actorOf(req) {
  return (req.auth && req.auth.user) || 'secretariat';
}

function validEmail(e) {
  return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// ranks list for the admin form suggestions
router.get('/meta', (req, res) => {
  res.json({ officers: OFFICER_RANKS, ratings: RATING_RANKS, statuses: STATUSES });
});

// full register as a spreadsheet-friendly CSV
router.get('/export.csv', asyncHandler(async (req, res) => {
  const members = (await listMembers()).sort((a, b) => a.fullName.localeCompare(b.fullName));
  const cols = [
    ['memberNo', 'Member No.'], ['fullName', 'Full Name'], ['rank', 'Rank'], ['rankCategory', 'Category'],
    ['serviceNo', 'Service No.'], ['command', 'Command / Base'], ['serviceStatus', 'Service Status'],
    ['status', 'Membership Status'], ['membershipTier', 'Tier'], ['phone', 'Phone'], ['email', 'Email'],
    ['address', 'Address'], ['createdAt', 'Registered'], ['notes', 'Notes']
  ];
  // a leading = + - @ makes Excel run the cell as a formula, so neutralise those
  const cell = (v) => {
    let s = v === undefined || v === null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const lines = [cols.map((c) => cell(c[1])).join(',')];
  members.forEach((m) => {
    const row = withComputed(m);
    lines.push(cols.map((c) => cell(row[c[0]])).join(','));
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="nnpa-personnel-register-' + new Date().toISOString().slice(0, 10) + '.csv"');
  res.send('\uFEFF' + lines.join('\r\n'));
}));

// complete copy of the register (including rank history + activity log)
router.get('/backup.json', asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="nnpa-personnel-backup-' + new Date().toISOString().slice(0, 10) + '.json"');
  res.send(JSON.stringify(await listMembers(), null, 2));
}));

router.get('/', asyncHandler(async (req, res) => {
  res.json((await listMembers()).map(withComputed));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const member = await getMember(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(withComputed(member));
}));

// add a member directly (e.g. someone who signed up on paper or in person)
router.post('/', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const fullName = (body.fullName || '').trim();
  const serviceNo = (body.serviceNo || '').trim();
  const rank = (body.rank || '').trim();
  if (!fullName || !serviceNo || !rank) {
    return res.status(400).json({ error: 'Full name, service number and rank are required' });
  }
  if (!validEmail((body.email || '').trim())) {
    return res.status(400).json({ error: 'That email address does not look valid' });
  }

  const status = STATUSES.includes(body.status) ? body.status : 'active';
  try {
    const member = await createMember(body, { source: 'secretariat', status, actor: actorOf(req) });
    res.status(201).json(withComputed(member));
  } catch (err) {
    if (err.code === 'DUPLICATE_SERVICE_NO') return res.status(409).json({ error: err.message });
    throw err;
  }
}));

// edit a record. rank changes are written to the rank history, never overwritten.
router.patch('/:id', asyncHandler(async (req, res) => {
  const member = await getMember(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const body = req.body || {};
  const actor = actorOf(req);
  const now = new Date().toISOString();
  const changes = [];

  if (body.serviceNo !== undefined) {
    const sn = String(body.serviceNo).trim();
    if (!sn) return res.status(400).json({ error: 'Service number cannot be blank' });
    const dup = await findByServiceNo(sn, member.id);
    if (dup) return res.status(409).json({ error: 'Service number already belongs to ' + dup.fullName + ' (' + dup.memberNo + ')' });
  }
  if (body.fullName !== undefined && !String(body.fullName).trim()) {
    return res.status(400).json({ error: 'Full name cannot be blank' });
  }
  if (body.rank !== undefined && !String(body.rank).trim()) {
    return res.status(400).json({ error: 'Rank cannot be blank' });
  }
  if (body.email !== undefined && !validEmail(String(body.email).trim())) {
    return res.status(400).json({ error: 'That email address does not look valid' });
  }
  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  EDITABLE.forEach((field) => {
    if (body[field] === undefined) return;
    let next = String(body[field]).trim();
    if (field === 'serviceStatus') next = next === 'retired' ? 'retired' : 'serving';
    if (member[field] === next) return;

    if (field === 'rank') {
      member.rankHistory = member.rankHistory || [];
      member.rankHistory.push({
        rank: next,
        effectiveDate: (body.rankDate && /^\d{4}-\d{2}-\d{2}$/.test(body.rankDate)) ? body.rankDate : now.slice(0, 10),
        recordedAt: now,
        recordedBy: actor
      });
      changes.push('Rank changed from ' + (member.rank || '—') + ' to ' + next);
    } else {
      changes.push(field + ' updated');
    }
    member[field] = next;
  });

  let statusSync = null;
  if (body.status !== undefined && body.status !== member.status) {
    const previous = member.status;
    changes.push('Status changed from ' + previous + ' to ' + body.status);
    member.status = body.status;
    // keep the linked application's status in step when a pending signup is decided
    if (member.applicationId && previous === 'pending') {
      if (body.status === 'active') statusSync = 'approved';
      if (body.status === 'archived') statusSync = 'declined';
    }
  }

  if (changes.length) {
    member.updatedAt = now;
    member.activity = member.activity || [];
    changes.forEach((text) => member.activity.push({ at: now, by: actor, text }));
    try {
      await saveMember(member);
    } catch (err) {
      if (err.code === 'DUPLICATE_SERVICE_NO') return res.status(409).json({ error: err.message });
      throw err;
    }
    if (statusSync) {
      try {
        await getDb().collection('applications').updateOne({ id: member.applicationId }, { $set: { status: statusSync } });
      } catch (err) {
        console.error('Could not sync application status for member', member.id, err);
      }
    }
  }
  res.json(withComputed(member));
}));

// NOTE: there is deliberately no DELETE. Records are permanent — to retire someone from
// active use, set their status to "archived" and they stay on the register with full history.

module.exports = router;
