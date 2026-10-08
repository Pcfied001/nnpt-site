/* ============================================================
   Nigerian Navy Polo Association — shared photo gallery
   Single source of truth for photos. Which photos appear in the
   homepage slideshow is chosen by the secretariat in the admin
   dashboard (Slideshow tab). defaultFeatured below is only the
   starting selection, used until a choice has been saved there.
   ============================================================ */

// The photo library. Add a new photo by adding an entry here (and
// dropping the image into assets/img/) — it will show up on the
// Gallery page automatically, set defaultFeatured: true to put it in the slideshow.
var NNPA_GALLERY_PHOTOS = [
  {
    id: 'gallery-2',
    src: 'assets/img/gallery-2.jpeg',
    alt: 'Officers and members of the Nigerian Navy Polo Association',
    label: 'Nigerian Navy Polo Association',
    caption: 'Officers and members of the Association at the Naval Headquarters.',
    defaultFeatured: true
  },
  {
    id: 'gallery-1',
    src: 'assets/img/gallery-1.jpeg',
    alt: 'The Nigerian Navy Polo Association presenting the T.Y. Danjuma Cup to the Chief of Naval Staff',
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
  // the Nigerian Navy Polo Association won the Chairborne Cup, a 10-team event.
  {
    id: 'gallery-6',
    src: 'assets/img/gallery-6.jpg',
    alt: 'Nigerian Navy Polo Association riders chasing the ball during the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'The Navy team presses forward during the 2024 Port Harcourt International Polo Tournament, where they won the Chairborne Cup.',
    defaultFeatured: false
  },
  {
    id: 'gallery-7',
    src: 'assets/img/gallery-7.jpg',
    alt: 'Nigerian Navy Polo Association player riding forward, mallet raised, at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'A Navy player breaks forward in the Chairborne Cup at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-8',
    src: 'assets/img/gallery-8.jpg',
    alt: 'Nigerian Navy Polo Association player in white jersey riding a chestnut horse at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'Navy colours on the field during the Chairborne Cup at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-9',
    src: 'assets/img/gallery-9.jpg',
    alt: 'Nigerian Navy Polo Association players in a full swing during the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'A full stretch shot on goal during the Chairborne Cup, 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-10',
    src: 'assets/img/gallery-10.jpg',
    alt: 'Nigerian Navy Polo Association player cantering across the field at the 2024 Port Harcourt International Polo Tournament',
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
    alt: 'Nigerian Navy Polo Association and opponents lined up with mallets raised at the 2024 Port Harcourt International Polo Tournament',
    label: 'Chairborne Cup Champions 2024',
    caption: 'Teams salute at the close of play — the Nigerian Navy Polo Association went on to win the Chairborne Cup, a 10-team event, at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-13',
    src: 'assets/img/gallery-13.jpg',
    alt: 'Nigerian Navy Polo Association and opponents lined up on the pitch at the 2024 Port Harcourt International Polo Tournament',
    label: 'Chairborne Cup Champions 2024',
    caption: 'The competing teams line up on the pitch at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-14',
    src: 'assets/img/gallery-14.jpg',
    alt: 'Nigerian Navy Polo Association players grouped on the field at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'The Navy team regroups during play at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },
  {
    id: 'gallery-15',
    src: 'assets/img/gallery-15.jpg',
    alt: 'Nigerian Navy Polo Association in pursuit of the ball at the 2024 Port Harcourt International Polo Tournament',
    label: 'Port Harcourt International Polo Tournament 2024',
    caption: 'Navy riders in pursuit during the Chairborne Cup at the 2024 Port Harcourt International Polo Tournament.',
    defaultFeatured: false
  },

  // Additional tournament and ceremonial photos
  {
    id: 'gallery-16',
    src: 'assets/img/gallery-16.jpg',
    alt: 'Four mounted Nigerian Navy polo players lined up before a match',
    label: 'Nigerian Navy Polo Association',
    caption: 'The Nigerian Navy Polo Association lined up on horseback ahead of a match.',
    defaultFeatured: false
  },
  {
    id: 'gallery-17',
    src: 'assets/img/gallery-17.jpg',
    alt: 'Nigerian Navy Polo Association in action during a match, riders in pursuit of the ball',
    label: 'Match Action',
    caption: 'Navy riders in pursuit of the ball during competitive play.',
    defaultFeatured: false
  },
  {
    id: 'gallery-18',
    src: 'assets/img/gallery-18.jpg',
    alt: 'Nigerian Navy Polo Association players holding a trophy at an awards retrospective event',
    label: 'Awards Presentation',
    caption: 'Members of the Nigerian Navy Polo Association with a trophy at an awards retrospective event.',
    defaultFeatured: false
  },
  {
    id: 'gallery-19',
    src: 'assets/img/gallery-19.jpg',
    alt: 'Nigerian Navy Polo Association holding the Chief of Naval Staff Cup trophy on the pitch in Abuja',
    label: 'Chief of Naval Staff Cup',
    caption: 'The Nigerian Navy Polo Association with the Chief of Naval Staff Cup trophy.',
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
    alt: 'Nigerian Navy Polo Association players lined up with mallets before a match',
    label: 'Nigerian Navy Polo Association',
    caption: 'Nigerian Navy Polo Association players lined up with their mallets before a match.',
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
    alt: 'Nigerian Navy Polo Association members seated in the stands at the 2023 NPA Lagos International Polo Tournament',
    label: 'CNS Cup Finals 2023',
    caption: 'Nigerian Navy Polo Association members in the stands at the 2023 NPA Lagos International Polo Tournament.',
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
  },
  {
    id: 'gallery-30',
    src: 'assets/img/gallery-30.jpg',
    alt: 'A Navy player on a chestnut horse with a navy saddle cloth, mallet in hand, at the edge of the polo field',
    label: 'On the Field',
    caption: 'A Navy player, number 2, rides out onto the polo field with his mallet at the ready.',
    defaultFeatured: false
  },
  {
    id: 'gallery-31',
    src: 'assets/img/gallery-31.jpg',
    alt: 'A smiling rider in a navy blue jersey reaching out with his mallet while other riders close in during a polo match',
    label: 'In Play',
    caption: 'A smiling player in navy blue reaches with his mallet as riders close in during a lively passage of play.',
    defaultFeatured: false
  },
  {
    id: 'gallery-32',
    src: 'assets/img/gallery-32.jpg',
    alt: 'Two teammates in grey jerseys, numbers 1 and 2, sitting side by side on chestnut horses with polo mallets',
    label: 'Teammates',
    caption: 'Two teammates in grey jerseys, numbers 1 and 2, sit side by side on horseback before play.',
    defaultFeatured: false
  },
  {
    id: 'gallery-33',
    src: 'assets/img/gallery-33.jpg',
    alt: 'A polo player in a grey team jersey and sunglasses sitting on a chestnut horse with a white blaze',
    label: 'Ready to Ride',
    caption: 'A player in a grey team jersey waits on a chestnut horse, reins and mallet in hand.',
    defaultFeatured: false
  },
  {
    id: 'gallery-34',
    src: 'assets/img/gallery-34.jpg',
    alt: 'Polo players in red and white jerseys on horseback competing for the ball in the middle of a match',
    label: 'Contest for the Ball',
    caption: 'Riders in red and white jerseys crowd in on the ball during a close-fought moment of play.',
    defaultFeatured: false
  },
  {
    id: 'gallery-35',
    src: 'assets/img/gallery-35.jpg',
    alt: 'Close-up portrait of a polo player in a red number 1 jersey, helmet and sunglasses',
    label: 'Player Portrait',
    caption: 'A close-up of a player in a red number 1 jersey, helmet and sunglasses.',
    defaultFeatured: false
  }
];

var NNPAGallery = (function () {

  // ids the secretariat has deleted from the gallery in the admin dashboard (loaded from the server)
  var hiddenIds = [];

  function setHidden(ids) {
    hiddenIds = Array.isArray(ids) ? ids.slice() : [];
  }

  // Deleted photos are left out unless includeHidden is true (the admin Gallery tab needs them to offer Restore).
  function getAllPhotos(includeHidden) {
    return NNPA_GALLERY_PHOTOS.map(function (photo) {
      return Object.assign({}, photo, {
        featured: !!photo.defaultFeatured,
        hidden: hiddenIds.indexOf(photo.id) !== -1
      });
    }).filter(function (photo) { return includeHidden || !photo.hidden; });
  }

  // `ids` is the list saved by the secretariat in the admin dashboard. When there isn't one
  // (nothing chosen yet, or the server can't be reached) the defaults above are used.
  function getFeaturedPhotos(ids) {
    var all = getAllPhotos();
    if (Array.isArray(ids)) {
      var picked = all.filter(function (photo) { return ids.indexOf(photo.id) !== -1; });
      if (picked.length) return picked;
    }
    return all.filter(function (photo) { return photo.featured; });
  }

  return {
    setHidden: setHidden,
    getAllPhotos: getAllPhotos,
    getFeaturedPhotos: getFeaturedPhotos
  };

})();
