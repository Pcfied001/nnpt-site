const express = require('express');
const router = express.Router();
const secretariatAuth = require('../middleware/secretariatAuth');
const asyncHandler = require('../utils/asyncHandler');
const { getDb } = require('../config/db');

// Which gallery photos appear in the homepage slideshow. One small settings document in MongoDB.
// Reading is public (the homepage needs it); changing it needs the secretariat login.

const col = () => getDb().collection('settings');
const MAX_PHOTOS = 20;

router.get('/', asyncHandler(async (req, res) => {
  const doc = await col().findOne({ _id: 'slideshow' });
  res.setHeader('Cache-Control', 'no-cache');
  // ids: null means "nobody has chosen yet" — the site then uses the defaults in gallery-data.js
  res.json({ ids: doc && Array.isArray(doc.ids) ? doc.ids : null, updatedAt: doc ? doc.updatedAt : null });
}));

router.put('/', secretariatAuth, asyncHandler(async (req, res) => {
  const ids = req.body && req.body.ids;
  if (!Array.isArray(ids) || ids.length < 1) {
    return res.status(400).json({ error: 'Choose at least one photo for the slideshow' });
  }
  if (ids.length > MAX_PHOTOS) {
    return res.status(400).json({ error: 'Please choose no more than ' + MAX_PHOTOS + ' photos' });
  }
  const valid = ids.every((id) => typeof id === 'string' && /^gallery-\d{1,4}$/.test(id));
  if (!valid) return res.status(400).json({ error: 'Invalid photo selection' });

  const unique = Array.from(new Set(ids));
  const updatedAt = new Date().toISOString();
  await col().updateOne(
    { _id: 'slideshow' },
    { $set: { ids: unique, updatedAt, updatedBy: (req.auth && req.auth.user) || 'secretariat' } },
    { upsert: true }
  );
  res.json({ ids: unique, updatedAt });
}));

module.exports = router;
