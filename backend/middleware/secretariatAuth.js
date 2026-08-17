const basicAuth = require('express-basic-auth');

// set real ADMIN_USER/ADMIN_PASS in .env before going live, these are just dev fallbacks
const ADMIN_USER = process.env.ADMIN_USER || 'secretariat';
const ADMIN_PASS = process.env.ADMIN_PASS || 'change-me-before-launch';

let warned = false;
function warnIfUsingDefaults() {
  if (warned) return;
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
    console.warn(
      '\n[NNPT] WARNING: using default admin login (secretariat / change-me-before-launch). ' +
      'Set ADMIN_USER and ADMIN_PASS in .env before real applicants use this site.\n'
    );
    warned = true;
  }
}
warnIfUsingDefaults();

// gates the admin dashboard + GET routes on real applicant data.
// posting a new application/enquiry is still public, only viewing needs login
const secretariatAuth = basicAuth({
  users: { [ADMIN_USER]: ADMIN_PASS },
  challenge: true,
  realm: 'NNPT Secretariat'
});

module.exports = secretariatAuth;
