const express = require('express');
const router = express.Router();
const secretariatAuth = require('../middleware/secretariatAuth');
const asyncHandler = require('../utils/asyncHandler');
const { getDb } = require('../config/db');

// Gallery photos the secretariat has deleted from the website. The photo library itself lives in
// frontend/js/gallery-data.js (the image files are part of the site's code), so "deleting" a photo
// here hides it from the Gallery page and the homepage slideshow, and it can be restored later.
// One small settings document in MongoDB. Reading is public; changing it needs the secretariat login.

const col = () => getDb().collection('settings');
const MAX_HIDDEN = 500;

router.get('/', asyncHandler(async (req, res) => {
  const doc = await col().findOne({ _id: 'galleryHidden' });
  res.setHeader('Cache-Control', 'no-cache');
  res.json({ hidden: doc && Array.isArray(doc.hidden) ? doc.hidden : [] });
}));

router.put('/', secretariatAuth, asyncHandler(async (req, res) => {
  const hidden = req.body && req.body.hidden;
  if (!Array.isArray(hidden) || hidden.length > MAX_HIDDEN ||
      !hidden.every((id) => typeof id === 'string' && /^gallery-\d{1,4}$/.test(id))) {
    return res.status(400).json({ error: 'Invalid photo list' });
  }
  const unique = Array.from(new Set(hidden));
  await col().updateOne(
    { _id: 'galleryHidden' },
    { $set: { hidden: unique, updatedAt: new Date().toISOString(), updatedBy: (req.auth && req.auth.user) || 'secretariat' } },
    { upsert: true }
  );
  res.json({ hidden: unique });
}));

module.exports = router;
