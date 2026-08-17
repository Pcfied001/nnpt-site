const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'fallenHeroes.json');

function readHeroes() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function writeHeroes(heroes) {
  fs.writeFileSync(dataPath, JSON.stringify(heroes, null, 2));
}

// GET /api/fallen-heroes — list all
router.get('/', (req, res) => {
  res.json(readHeroes());
});

// GET /api/fallen-heroes/:id — single record
router.get('/:id', (req, res) => {
  const heroes = readHeroes();
  const hero = heroes.find((h) => h.id === Number(req.params.id));
  if (!hero) return res.status(404).json({ error: 'Fallen hero not found' });
  res.json(hero);
});

// POST /api/fallen-heroes — add a new record (e.g. from an admin form later)
router.post('/', (req, res) => {
  const heroes = readHeroes();
  const { name, rank, dateOfBirth, dateOfDeath, bio } = req.body;

  if (!name || !rank) {
    return res.status(400).json({ error: 'name and rank are required' });
  }

  const nextId = heroes.length ? Math.max(...heroes.map((h) => h.id)) + 1 : 1;
  const newHero = { id: nextId, name, rank, dateOfBirth, dateOfDeath, bio };
  heroes.push(newHero);
  writeHeroes(heroes);
  res.status(201).json(newHero);
});

// PUT /api/fallen-heroes/:id — update a record
router.put('/:id', (req, res) => {
  const heroes = readHeroes();
  const idx = heroes.findIndex((h) => h.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Fallen hero not found' });

  heroes[idx] = { ...heroes[idx], ...req.body, id: heroes[idx].id };
  writeHeroes(heroes);
  res.json(heroes[idx]);
});

// DELETE /api/fallen-heroes/:id — remove a record
router.delete('/:id', (req, res) => {
  const heroes = readHeroes();
  const idx = heroes.findIndex((h) => h.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Fallen hero not found' });

  const removed = heroes.splice(idx, 1)[0];
  writeHeroes(heroes);
  res.json(removed);
});

module.exports = router;
