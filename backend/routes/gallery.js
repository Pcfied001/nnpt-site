const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'gallery.json');

function readPhotos() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function writePhotos(photos) {
  fs.writeFileSync(dataPath, JSON.stringify(photos, null, 2));
}

// GET /api/gallery — list all photos
router.get('/', (req, res) => {
  res.json(readPhotos());
});

// GET /api/gallery/featured — photos currently selected for the homepage slideshow
router.get('/featured', (req, res) => {
  res.json(readPhotos().filter((p) => p.featured));
});

// GET /api/gallery/:id — single photo
router.get('/:id', (req, res) => {
  const photos = readPhotos();
  const photo = photos.find((p) => p.id === req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });
  res.json(photo);
});

// POST /api/gallery — add a new photo to the library
router.post('/', (req, res) => {
  const photos = readPhotos();
  const { id, src, alt, label, caption, featured } = req.body;

  if (!id || !src) {
    return res.status(400).json({ error: 'id and src are required' });
  }
  if (photos.some((p) => p.id === id)) {
    return res.status(409).json({ error: 'A photo with that id already exists' });
  }

  const newPhoto = { id, src, alt: alt || '', label: label || '', caption: caption || '', featured: !!featured };
  photos.push(newPhoto);
  writePhotos(photos);
  res.status(201).json(newPhoto);
});

// PUT /api/gallery/:id — update a photo (label, caption, featured, etc.)
router.put('/:id', (req, res) => {
  const photos = readPhotos();
  const idx = photos.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Photo not found' });

  photos[idx] = { ...photos[idx], ...req.body, id: photos[idx].id };
  writePhotos(photos);
  res.json(photos[idx]);
});

// PUT /api/gallery/:id/featured — toggle whether a photo is on the homepage slideshow
router.put('/:id/featured', (req, res) => {
  const photos = readPhotos();
  const idx = photos.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Photo not found' });

  photos[idx].featured = !!req.body.featured;
  writePhotos(photos);
  res.json(photos[idx]);
});

// DELETE /api/gallery/:id — remove a photo from the library
router.delete('/:id', (req, res) => {
  const photos = readPhotos();
  const idx = photos.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Photo not found' });

  const removed = photos.splice(idx, 1)[0];
  writePhotos(photos);
  res.json(removed);
});

module.exports = router;
