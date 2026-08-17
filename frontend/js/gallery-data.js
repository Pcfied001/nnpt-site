/* ============================================================
   Nigerian Navy Polo Team — shared photo gallery
   Single source of truth for photos. The Gallery page lets you
   pick which of these appear in the homepage featured slideshow;
   the choice is remembered in this browser (localStorage) until
   the site is wired up to the backend /api/gallery endpoint.
   ============================================================ */

var NNPT_GALLERY_STORAGE_KEY = 'nnpt-gallery-featured';

// The photo library. Add a new photo by adding an entry here (and
// dropping the image into assets/img/) — it will show up on the
// Gallery page automatically, ready to be added to the slideshow.
var NNPT_GALLERY_PHOTOS = [
  {
    id: 'gallery-2',
    src: 'assets/img/gallery-2.jpeg',
    alt: 'Officers and members of the Nigerian Navy Polo Team',
    label: 'Nigerian Navy Polo Team',
    caption: 'Officers and members of the Team at the Naval Headquarters.',
    defaultFeatured: true
  },
  {
    id: 'gallery-1',
    src: 'assets/img/gallery-1.jpeg',
    alt: 'The Nigerian Navy Polo Team presenting the T.Y. Danjuma Cup to the Chief of Naval Staff',
    label: 'T.Y. Danjuma Cup',
    caption: 'The polo team presents the T.Y. Danjuma Cup to the Chief of Naval Staff.',
    defaultFeatured: true
  },
  {
    id: 'gallery-3',
    src: 'assets/img/gallery-3.jpeg',
    alt: 'Riding boots presented to the Chief of Naval Staff',
    label: 'Ceremonial Presentation',
    caption: 'Riding boots presented to the Chief of Naval Staff.',
    defaultFeatured: true
  },
  {
    id: 'gallery-4',
    src: 'assets/img/gallery-4.jpeg',
    alt: 'The Chief of Naval Staff with the T.Y. Danjuma Cup',
    label: 'T.Y. Danjuma Cup',
    caption: 'The Chief of Naval Staff with the T.Y. Danjuma Cup.',
    defaultFeatured: true
  },
  {
    id: 'gallery-5',
    src: 'assets/img/gallery-5.jpeg',
    alt: 'The T.Y. Danjuma Cup presented to the Chief of Naval Staff',
    label: 'T.Y. Danjuma Cup',
    caption: 'The T.Y. Danjuma Cup presented to the Chief of Naval Staff.',
    defaultFeatured: true
  },

  // 2024 Port Harcourt International Polo Tournament (14–21 Jan 2024) —
  // the Nigerian Navy Polo Team won the Chairborne Cup, a 10-team event.
  {
    id: 'gallery-6',
    src: 'assets/img/gallery-6.jpg',
    alt: 'Nigerian Navy Polo Team riders chasing the ball during the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'The Navy team presses forward during the 2024 Port Harcourt International Polo Tournament, where they won the Chairborne Cup.',
    defaultFeatured: false
  },
  {
    id: 'gallery-7',
    src: 'assets/img/gallery-7.jpg',
    alt: 'Nigerian Navy Polo Team player riding forward, mallet raised, at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'A Navy player breaks forward in the Chairborne Cup at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-8',
    src: 'assets/img/gallery-8.jpg',
    alt: 'Nigerian Navy Polo Team player in white jersey riding a chestnut horse at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'Navy colours on the field during the Chairborne Cup at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-9',
    src: 'assets/img/gallery-9.jpg',
    alt: 'Nigerian Navy Polo Team players in a full swing during the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'A full stretch shot on goal during the Chairborne Cup, 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-10',
    src: 'assets/img/gallery-10.jpg',
    alt: 'Nigerian Navy Polo Team player cantering across the field at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'A Navy rider covers the field during the Chairborne Cup at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-11',
    src: 'assets/img/gallery-11.jpg',
    alt: 'Two players walking their horses together at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'A quiet moment between chukkas at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-12',
    src: 'assets/img/gallery-12.jpg',
    alt: 'Nigerian Navy Polo Team and opponents lined up with mallets raised at the 2024 Port Harcourt International Polo Tournament',
    label: 'Chairborne Cup Champions 2024',
    caption: 'Teams salute at the close of play — the Nigerian Navy Polo Team went on to win the Chairborne Cup, a 10-team event, at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-13',
    src: 'assets/img/gallery-13.jpg',
    alt: 'Nigerian Navy Polo Team and opponents lined up on the pitch at the 2024 Port Harcourt International Polo Tournament',
    label: 'Chairborne Cup Champions 2024',
    caption: 'The competing teams line up on the pitch at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-14',
    src: 'assets/img/gallery-14.jpg',
    alt: 'Nigerian Navy Polo Team players grouped on the field at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'The Navy team regroups during play at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-15',
    src: 'assets/img/gallery-15.jpg',
    alt: 'Nigerian Navy Polo Team in pursuit of the ball at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'Navy riders in pursuit during the Chairborne Cup at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },

  // Additional tournament and ceremonial photos
  {
    id: 'gallery-16',
    src: 'assets/img/gallery-16.jpg',
    alt: 'Four mounted Nigerian Navy polo players lined up before a match',
    label: 'Nigerian Navy Polo Team',
    caption: 'The Nigerian Navy Polo Team lined up on horseback ahead of a match.',
    defaultFeatured: false
  },
  {
    id: 'gallery-17',
    src: 'assets/img/gallery-17.jpg',
    alt: 'Nigerian Navy Polo Team in action during a match, riders in pursuit of the ball',
    label: 'Match Action',
    caption: 'Navy riders in pursuit of the ball during competitive play.',
    defaultFeatured: false
  },
  {
    id: 'gallery-18',
    src: 'assets/img/gallery-18.jpg',
    alt: 'Nigerian Navy Polo Team players holding a trophy at an awards retrospective event',
    label: 'Awards Presentation',
    caption: 'Members of the Nigerian Navy Polo Team with a trophy at an awards retrospective event.',
    defaultFeatured: false
  },
  {
    id: 'gallery-19',
    src: 'assets/img/gallery-19.jpg',
    alt: 'Nigerian Navy Polo Team holding the Chief of Naval Staff Cup trophy on the pitch in Abuja',
    label: 'Chief of Naval Staff Cup',
    caption: 'The Nigerian Navy Polo Team with the Chief of Naval Staff Cup trophy.',
    defaultFeatured: false
  },
  {
    id: 'gallery-20',
    src: 'assets/img/gallery-20.jpg',
    alt: 'A Nigerian Navy polo player being congratulated with the Chief of Naval Staff Cup trophy',
    label: 'Chief of Naval Staff Cup',
    caption: 'A Navy player is congratulated after receiving the Chief of Naval Staff Cup.',
    defaultFeatured: false
  },
  {
    id: 'gallery-21',
    src: 'assets/img/gallery-21.jpg',
    alt: 'Trophy presentation at an evening polo event sponsored by Coronation',
    label: 'Trophy Presentation',
    caption: 'A trophy is presented at an evening polo event.',
    defaultFeatured: false
  },
  {
    id: 'gallery-22',
    src: 'assets/img/gallery-22.jpg',
    alt: 'Polo team in red jerseys posing with an official at a tournament',
    label: 'Tournament Photo',
    caption: 'A visiting polo team poses with an official at a tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-23',
    src: 'assets/img/gallery-23.jpg',
    alt: 'Nigerian Navy Polo Team players lined up with mallets before a match',
    label: 'Nigerian Navy Polo Team',
    caption: 'Nigerian Navy Polo Team players lined up with their mallets before a match.',
    defaultFeatured: false
  },
  {
    id: 'gallery-24',
    src: 'assets/img/gallery-24.jpg',
    alt: 'A senior Nigerian Navy officer in ceremonial white uniform saluting',
    label: 'Ceremonial Salute',
    caption: 'A senior Nigerian Navy officer salutes in ceremonial white uniform.',
    defaultFeatured: false
  },
  {
    id: 'gallery-25',
    src: 'assets/img/gallery-25.jpg',
    alt: 'Polo players in action on the pitch at the CNS Cup Finals, Lagos International Polo Tournament 2023',
    label: 'CNS Cup Finals 2023',
    caption: 'Riders in pursuit during the CNS Cup Finals at the Lagos International Polo Tournament, 18 February 2023.',
    defaultFeatured: false
  },
  {
    id: 'gallery-26',
    src: 'assets/img/gallery-26.jpg',
    alt: 'Officials addressing the crowd at the podium during the 2023 CNS Cup, Lagos International Polo Tournament',
    label: 'CNS Cup Finals 2023',
    caption: 'Officials address the crowd at the podium during the 2023 CNS Cup.',
    defaultFeatured: false
  },
  {
    id: 'gallery-27',
    src: 'assets/img/gallery-27.jpg',
    alt: 'Nigerian Navy Polo Team members seated in the stands at the 2023 NPA Lagos International Polo Tournament',
    label: 'CNS Cup Finals 2023',
    caption: 'Nigerian Navy Polo Team members in the stands at the 2023 NPA Lagos International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-28',
    src: 'assets/img/gallery-28.jpg',
    alt: 'Trophy presentation on stage at the 2023 NPA Lagos International Polo Tournament',
    label: 'CNS Cup Finals 2023',
    caption: 'Trophy presentation on stage at the 2023 NPA Lagos International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-29',
    src: 'assets/img/gallery-29.jpg',
    alt: 'Polo players on horseback lining up before the CNS Cup Finals, Lagos International Polo Tournament 2023',
    label: 'CNS Cup Finals 2023',
    caption: 'Players on horseback line up before the CNS Cup Finals, 18 February 2023.',
    defaultFeatured: false
  }
];

var NNPTGallery = (function () {

  function readOverrides() {
    try {
      var raw = window.localStorage.getItem(NNPT_GALLERY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  function writeOverrides(overrides) {
    try {
      window.localStorage.setItem(NNPT_GALLERY_STORAGE_KEY, JSON.stringify(overrides));
    } catch (err) { /* localStorage unavailable — selection just won't persist */ }
  }

  function isFeatured(photo, overrides) {
    return Object.prototype.hasOwnProperty.call(overrides, photo.id)
      ? !!overrides[photo.id]
      : !!photo.defaultFeatured;
  }

  function getAllPhotos() {
    var overrides = readOverrides();
    return NNPT_GALLERY_PHOTOS.map(function (photo) {
      return Object.assign({}, photo, { featured: isFeatured(photo, overrides) });
    });
  }

  function getFeaturedPhotos() {
    return getAllPhotos().filter(function (photo) { return photo.featured; });
  }

  function setFeatured(id, featured) {
    var overrides = readOverrides();
    overrides[id] = !!featured;
    writeOverrides(overrides);
  }

  function toggleFeatured(id) {
    var photo = getAllPhotos().filter(function (p) { return p.id === id; })[0];
    var next = photo ? !photo.featured : true;
    setFeatured(id, next);
    return next;
  }

  return {
    getAllPhotos: getAllPhotos,
    getFeaturedPhotos: getFeaturedPhotos,
    setFeatured: setFeatured,
    toggleFeatured: toggleFeatured
  };

})();
