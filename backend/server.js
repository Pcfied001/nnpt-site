require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connect } = require('./config/db');

const secretariatAuth = require('./middleware/secretariatAuth');
const fallenHeroesRouter = require('./routes/fallenHeroes');
const trophiesRouter = require('./routes/trophies');
const galleryRouter = require('./routes/gallery');
const applicationsRouter = require('./routes/applications');
const enquiriesRouter = require('./routes/enquiries');
const membersRouter = require('./routes/members');
const slideshowRouter = require('./routes/slideshow');
const galleryHiddenRouter = require('./routes/galleryHidden');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// the application form sends the passport photo inside the JSON body (~150 KB), so the default 100 KB limit is too small
app.use(express.json({ limit: '3mb' }));

// needs to come before express.static or the static handler serves this unprotected
app.get('/admin.html', secretariatAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});

// simple health check (Render can poll this)
app.get('/healthz', (req, res) => res.json({ ok: true }));

// GET routes with real applicant data are locked down inside the route files themselves
app.use('/api/fallen-heroes', fallenHeroesRouter);
app.use('/api/trophies', trophiesRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/members', membersRouter);
app.use('/api/slideshow', slideshowRouter);
app.use('/api/gallery-hidden', galleryHiddenRouter);

// old-style /page.html links redirect to the clean /page version (admin.html stays as-is, handled above)
app.get('/:page.html', (req, res, next) => {
  if (req.params.page === 'admin') return next();
  const target = req.params.page === 'index' ? '/' : `/${req.params.page}`;
  res.redirect(301, target);
});

// static frontend last (admin.html already handled above); extensions lets
// /contact resolve to contact.html without the .html showing in the URL
app.use(express.static(path.join(__dirname, '..', 'frontend'), { extensions: ['html'] }));

// last-resort error handler for the API (async route errors land here)
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
});

// connect to the database first, so the site never serves requests it can't save
connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`NNPA server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('\n[NNPA] Could not start: ' + err.message + '\n');
    process.exit(1);
  });
