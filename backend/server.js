require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const secretariatAuth = require('./middleware/secretariatAuth');
const fallenHeroesRouter = require('./routes/fallenHeroes');
const trophiesRouter = require('./routes/trophies');
const galleryRouter = require('./routes/gallery');
const applicationsRouter = require('./routes/applications');
const enquiriesRouter = require('./routes/enquiries');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// needs to come before express.static or the static handler serves this unprotected
app.get('/admin.html', secretariatAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});

// GET routes with real applicant data are locked down inside the route files themselves
app.use('/api/fallen-heroes', fallenHeroesRouter);
app.use('/api/trophies', trophiesRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/enquiries', enquiriesRouter);

// old-style /page.html links redirect to the clean /page version (admin.html stays as-is, handled above)
app.get('/:page.html', (req, res, next) => {
  if (req.params.page === 'admin') return next();
  const target = req.params.page === 'index' ? '/' : `/${req.params.page}`;
  res.redirect(301, target);
});

// static frontend last (admin.html already handled above); extensions lets
// /contact resolve to contact.html without the .html showing in the URL
app.use(express.static(path.join(__dirname, '..', 'frontend'), { extensions: ['html'] }));

app.listen(PORT, () => {
  console.log(`NNPT server running at http://localhost:${PORT}`);
});
