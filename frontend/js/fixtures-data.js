/* ============================================================
   Nigerian Navy Polo Team — shared fixtures data
   Single source of truth for match fixtures. Edit an entry (or
   add a new one) here and the change appears automatically both
   in the homepage Fixtures section and on the full Fixtures page
   — no need to edit the tables in the HTML directly.

   status: 'open' or 'closed' controls the entry pill shown.
   ============================================================ */

var NNPT_FIXTURES = [
  {
    id: 'fx-1',
    dateLabel: 'SEP 06',
    fixture: 'Navy Cup — Opening Chukka',
    venue: 'Abuja Polo Club Grounds',
    status: 'open'
  },
  {
    id: 'fx-2',
    dateLabel: 'OCT 11',
    fixture: 'Inter-Command Tournament',
    venue: 'Lagos Polo Club',
    status: 'open'
  },
  {
    id: 'fx-3',
    dateLabel: 'NOV 22',
    fixture: "Fleet Officers' Invitational",
    venue: 'Kaduna Polo Club',
    status: 'closed'
  },
  {
    id: 'fx-4',
    dateLabel: 'DEC 14',
    fixture: 'Team Anniversary Cup',
    venue: 'Guards Polo Club Abuja',
    status: 'open'
  }
];

var NNPTFixtures = {
  getAll: function () {
    return NNPT_FIXTURES.slice();
  }
};
