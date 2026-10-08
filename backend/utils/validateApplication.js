// Server-side check for the membership application. The browser form already blocks incomplete
// submissions, but anyone can call the API directly, so every rule is enforced here as well.

const SEX_OPTIONS = ['Male', 'Female'];
const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;   // decoded size. the form sends ~100-200 KB
const MIN_PHOTO_BYTES = 1000;

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function validPhone(p) {
  const digits = p.replace(/\D/g, '');
  return /^[+()\-.\s\d]+$/.test(p) && digits.length >= 7 && digits.length <= 15;
}

function validDob(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return 'Enter a valid date.';
  const [y, m, day] = d.split('-').map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, day));
  if (parsed.getUTCFullYear() !== y || parsed.getUTCMonth() !== m - 1 || parsed.getUTCDate() !== day) return 'Enter a valid date.';
  if (y < 1900) return 'Enter a valid date of birth.';
  if (parsed.getTime() > Date.now()) return 'Date of birth cannot be in the future.';
  return '';
}

// accepts the data URL the form sends and returns the bare base64 JPEG, or an error message
function readPhoto(value) {
  if (typeof value !== 'string' || !value) return { error: 'Please add your passport photograph.' };
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!m) return { error: 'The photograph must be a JPG, PNG or WebP image.' };
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length < MIN_PHOTO_BYTES || !(buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)) {
    return { error: 'That photograph could not be read. Please upload a different one.' };
  }
  if (buf.length > MAX_PHOTO_BYTES) return { error: 'That photograph is too large. Please upload a smaller one.' };
  return { base64: m[1] };
}

// returns { errors: { field: message }, values: { ...cleaned fields } }
function validateApplication(body) {
  body = body || {};
  const errors = {};
  const values = {};
  const isCivilian = body.applicantType === 'civilian';
  values.applicantType = isCivilian ? 'civilian' : 'serviceman';

  const need = (key, label, maxLen) => {
    const v = str(body[key]);
    values[key] = v;
    if (!v) errors[key] = label + ' is required.';
    else if (v.length > (maxLen || 200)) errors[key] = label + ' is too long.';
    return v;
  };

  need('fullName', 'Full name');
  const email = need('email', 'Email address');
  if (email && !errors.email && !validEmail(email)) errors.email = 'Enter a valid email address.';
  const phone = need('phone', 'Phone number', 40);
  if (phone && !errors.phone && !validPhone(phone)) errors.phone = 'Enter a valid phone number.';
  need('address', 'Residential address', 300);

  const dob = need('dateOfBirth', 'Date of birth', 10);
  if (dob && !errors.dateOfBirth) {
    const msg = validDob(dob);
    if (msg) errors.dateOfBirth = msg;
  }

  const sex = need('sex', 'Sex', 10);
  if (sex && !errors.sex && !SEX_OPTIONS.includes(sex)) errors.sex = 'Please choose Male or Female.';

  need('tier', 'Membership category', 60);
  need('experience', 'Polo experience', 60);
  need('note', 'Your reason for joining', 2000);

  if (isCivilian) {
    need('occupation', 'Occupation');
    need('org', 'Organisation / employer');
    need('sponsor', 'Proposing member');
    Object.assign(values, { serviceNo: '', rank: '', command: '', serviceStatus: '' });
  } else {
    need('serviceNo', 'Service number', 60);
    need('rank', 'Rank', 80);
    need('command', 'Command / base');
    const status = need('serviceStatus', 'Service status', 10);
    if (status && !errors.serviceStatus && !['serving', 'retired'].includes(status)) errors.serviceStatus = 'Choose serving or retired.';
    Object.assign(values, { occupation: '', org: '', sponsor: '' });
  }

  const photo = readPhoto(body.photo);
  if (photo.error) errors.photo = photo.error;
  else values.photo = photo.base64;

  return { errors, values };
}

module.exports = { validateApplication, SEX_OPTIONS };
