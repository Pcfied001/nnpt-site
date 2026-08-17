const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'trophies.json');

function readTrophies() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function writeTrophies(trophies) {
  fs.writeFileSync(dataPath, JSON.stringify(trophies, null, 2));
}

// GET /api/trophies — list all
router.get('/', (req, res) => {
  res.json(readTrophies());
});

// GET /api/trophies/:id — single record
router.get('/:id', (req, res) => {
  const trophies = readTrophies();
  const trophy = trophies.find((t) => t.id === Number(req.params.id));
  if (!trophy) return res.status(404).json({ error: 'Trophy not found' });
  res.json(trophy);
});

// POST /api/trophies — add a new record
router.post('/', (req, res) => {
  const trophies = readTrophies();
  const { name, year, story } = req.body;

  if (!name || !year) {
    return res.status(400).json({ error: 'name and year are required' });
  }

  const nextId = trophies.length ? Math.max(...trophies.map((t) => t.id)) + 1 : 1;
  const newTrophy = { id: nextId, name, year, story };
  trophies.push(newTrophy);
  writeTrophies(trophies);
  res.status(201).json(newTrophy);
});

// PUT /api/trophies/:id — update a record
router.put('/:id', (req, res) => {
  const trophies = readTrophies();
  const idx = trophies.findIndex((t) => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Trophy not found' });

  trophies[idx] = { ...trophies[idx], ...req.body, id: trophies[idx].id };
  writeTrophies(trophies);
  res.json(trophies[idx]);
});

// DELETE /api/trophies/:id — remove a record
router.delete('/:id', (req, res) => {
  const trophies = readTrophies();
  const idx = trophies.findIndex((t) => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Trophy not found' });

  const removed = trophies.splice(idx, 1)[0];
  writeTrophies(trophies);
  res.json(removed);
});

module.exports = router;
