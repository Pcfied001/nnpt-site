// Nigerian Navy rank structure, highest first. Used for suggestions and for
// grouping members into Officers / Ratings. Ranks outside this list are still
// accepted (they're just filed as "Other") so the secretariat is never blocked.

const OFFICER_RANKS = [
  'Admiral', 'Vice Admiral', 'Rear Admiral', 'Commodore', 'Captain', 'Commander',
  'Lieutenant Commander', 'Lieutenant', 'Sub-Lieutenant', 'Midshipman'
];

const RATING_RANKS = [
  'Master Warrant Officer', 'Warrant Officer', 'Chief Petty Officer', 'Petty Officer',
  'Leading Seaman', 'Able Seaman', 'Ordinary Seaman'
];

const ALL_RANKS = OFFICER_RANKS.concat(RATING_RANKS);

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z]/g, '');
}

function rankCategory(rank) {
  const n = norm(rank);
  if (!n) return 'Other';
  if (OFFICER_RANKS.some((r) => norm(r) === n)) return 'Officer';
  if (RATING_RANKS.some((r) => norm(r) === n)) return 'Rating';
  return 'Other';
}

// 0 = most senior. Unknown ranks sort last.
function rankOrder(rank) {
  const n = norm(rank);
  const idx = ALL_RANKS.findIndex((r) => norm(r) === n);
  return idx === -1 ? ALL_RANKS.length : idx;
}

module.exports = { OFFICER_RANKS, RATING_RANKS, ALL_RANKS, rankCategory, rankOrder };
