/* ============================================================
   Nigerian Navy Polo Team — site scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav toggle ---------- */
  var menuToggle = document.querySelector('.menu-toggle');
  var navList = document.querySelector('nav ul');
  if (menuToggle && navList) {
    menuToggle.addEventListener('click', function () {
      navList.classList.toggle('nav-open');
    });
    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('nav-open');
      });
    });
  }

  /* ---------- "More" nav dropdowns (desktop) — hover reveals them slowly via CSS;
     click/keyboard support here is the fallback for touch and keyboard users ---------- */
  var allNavMore = document.querySelectorAll('.nav-more');
  allNavMore.forEach(function (navMore) {
    var navMoreToggle = navMore.querySelector('.nav-more-toggle');
    function closeNavMore() {
      navMore.classList.remove('is-open');
      if (navMoreToggle) navMoreToggle.setAttribute('aria-expanded', 'false');
    }
    if (navMoreToggle) {
      navMoreToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !navMore.classList.contains('is-open');
        navMore.classList.toggle('is-open', willOpen);
        navMoreToggle.setAttribute('aria-expanded', String(willOpen));
      });
    }
    navMore.querySelectorAll('.nav-more-menu a').forEach(function (link) {
      link.addEventListener('click', closeNavMore);
    });
    document.addEventListener('click', function (e) {
      if (!navMore.contains(e.target)) closeNavMore();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNavMore();
    });
  });

  /* ---------- Contact / enquiry form ---------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('contactNote');
      var btn = document.getElementById('contactSubmit');
      var defaultNoteText = 'We typically respond within 3–5 working days.';

      var payload = {
        name: (document.getElementById('fname') || {}).value,
        email: (document.getElementById('femail') || {}).value,
        subject: (document.getElementById('finterest') || {}).value,
        message: (document.getElementById('fmsg') || {}).value
      };

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Submission failed');
          return res.json();
        })
        .then(function () {
          if (note) note.textContent = 'Thank you — your enquiry has been received. ' + defaultNoteText;
          if (btn) { btn.textContent = 'Sent'; }
          contactForm.reset();
        })
        .catch(function () {
          if (note) note.textContent = 'We couldn\'t send this automatically. Please email secretariat@nnpolo.org directly.';
          if (btn) { btn.disabled = false; btn.textContent = 'Send Enquiry'; }
        });
    });
  }

  /* ---------- Membership application form ---------- */
  var membershipForm = document.getElementById('membershipForm');
  if (membershipForm) {
    var typeRadios = membershipForm.querySelectorAll('input[name="applicantType"]');

    function syncApplicantType() {
      var selected = membershipForm.querySelector('input[name="applicantType"]:checked');
      var value = selected ? selected.value : 'serviceman';
      membershipForm.classList.remove('show-serviceman', 'show-civilian');
      membershipForm.classList.add(value === 'civilian' ? 'show-civilian' : 'show-serviceman');
    }

    typeRadios.forEach(function (radio) {
      radio.addEventListener('change', syncApplicantType);
    });
    syncApplicantType();

    var submitOverlay = document.getElementById('submitModalOverlay');
    var submitClose = document.getElementById('submitModalClose');
    var submitOk = document.getElementById('submitModalOk');

    function openSubmitModal() {
      if (!submitOverlay) return;
      submitOverlay.classList.add('active');
    }
    function closeSubmitModal() {
      if (!submitOverlay) return;
      submitOverlay.classList.remove('active');
    }
    if (submitClose) submitClose.addEventListener('click', closeSubmitModal);
    if (submitOk) submitOk.addEventListener('click', closeSubmitModal);
    if (submitOverlay) {
      submitOverlay.addEventListener('click', function (e) {
        if (e.target === submitOverlay) closeSubmitModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && submitOverlay && submitOverlay.classList.contains('active')) closeSubmitModal();
    });

    membershipForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('applyNote');
      var btn = document.getElementById('applySubmit');
      var selectedType = membershipForm.querySelector('input[name="applicantType"]:checked');

      var payload = {
        applicantType: selectedType ? selectedType.value : 'serviceman',
        fullName: (document.getElementById('aFullName') || {}).value,
        email: (document.getElementById('aEmail') || {}).value,
        phone: (document.getElementById('aPhone') || {}).value,
        address: (document.getElementById('aAddress') || {}).value,
        tier: (document.getElementById('aTier') || {}).value,
        experience: (document.getElementById('aExperience') || {}).value,
        serviceNo: (document.getElementById('aServiceNo') || {}).value,
        rank: (document.getElementById('aRank') || {}).value,
        command: (document.getElementById('aCommand') || {}).value,
        occupation: (document.getElementById('aOccupation') || {}).value,
        org: (document.getElementById('aOrg') || {}).value,
        sponsor: (document.getElementById('aSponsor') || {}).value,
        note: (document.getElementById('aNote') || {}).value
      };

      if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Submission failed');
          return res.json();
        })
        .then(function () {
          if (note) note.textContent = 'Thank you — your application has been received. The secretariat will contact you within 5–7 working days.';
          if (btn) { btn.textContent = 'Application Submitted'; }
          openSubmitModal();
        })
        .catch(function () {
          if (note) note.textContent = 'We couldn\'t submit this automatically. Please email your details to secretariat@nnpolo.org and the secretariat will follow up directly.';
          if (btn) { btn.disabled = false; btn.textContent = 'Submit Application'; }
        });
    });
  }

  /* ---------- Home page featured slideshow ---------- */
  var slideshow = document.getElementById('featuredSlideshow');
  if (slideshow) {
    // Populate slides from the shared Gallery data (photos marked
    // "featured" on the Gallery page). Falls back to whatever
    // static slides are already in the markup if gallery data isn't loaded.
    if (typeof NNPTGallery !== 'undefined') {
      var featuredPhotos = NNPTGallery.getFeaturedPhotos();
      if (featuredPhotos.length) {
        var existingDots = document.getElementById('featuredSlideshowDots');
        var existingNav = slideshow.querySelectorAll('.slide-nav');
        slideshow.querySelectorAll('.f-slide').forEach(function (el) { el.remove(); });
        var navAnchor = existingDots || existingNav[0] || null;
        featuredPhotos.forEach(function (photo, i) {
          var slide = document.createElement('div');
          slide.className = 'f-slide' + (i === 0 ? ' active' : '');
          slide.innerHTML =
            '<img src="' + photo.src + '" alt="' + photo.alt + '">' +
            '<div class="featured-caption">' +
              '<span class="mono">' + photo.label + '</span>' +
              '<p>' + photo.caption + '</p>' +
            '</div>';
          slideshow.insertBefore(slide, navAnchor);
        });
      }
    }

    var slides = slideshow.querySelectorAll('.f-slide');
    var dotsWrap = document.getElementById('featuredSlideshowDots');
    var prevBtn = slideshow.querySelector('.slide-prev');
    var nextBtn = slideshow.querySelector('.slide-next');
    var current = 0;
    var autoplayDelay = 5500;
    var autoplayTimer = null;

    dotsWrap.innerHTML = '';
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () {
        goToSlide(i);
        resetAutoplay();
      });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('.slide-dot');

    function goToSlide(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function nextSlide() { goToSlide(current + 1); }
    function prevSlide() { goToSlide(current - 1); }

    function startAutoplay() {
      autoplayTimer = setInterval(nextSlide, autoplayDelay);
    }
    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prevSlide(); resetAutoplay(); });

    slideshow.addEventListener('mouseenter', function () { clearInterval(autoplayTimer); });
    slideshow.addEventListener('mouseleave', function () { startAutoplay(); });

    startAutoplay();
  }

  /* ---------- Fixtures table (home page + Fixtures page) ----------
     Both pages render from the single NNPT_FIXTURES source in
     fixtures-data.js — update a fixture there and it appears on
     both places at once.
  */
  var fixturesBody = document.getElementById('fixturesTableBody');
  if (fixturesBody && typeof NNPTFixtures !== 'undefined') {
    var fixtures = NNPTFixtures.getAll();
    fixturesBody.innerHTML = '';
    fixtures.forEach(function (fx) {
      var tr = document.createElement('tr');
      var isClosed = fx.status === 'closed';
      var dateCell = document.createElement('td');
      dateCell.className = 'date';
      dateCell.textContent = fx.dateLabel;
      var fixtureCell = document.createElement('td');
      fixtureCell.textContent = fx.fixture;
      var venueCell = document.createElement('td');
      venueCell.textContent = fx.venue;
      var entryCell = document.createElement('td');
      var pill = document.createElement('span');
      pill.className = 'status-pill' + (isClosed ? ' closed' : '');
      pill.textContent = isClosed ? 'Closed' : 'Open';
      entryCell.appendChild(pill);
      tr.appendChild(dateCell);
      tr.appendChild(fixtureCell);
      tr.appendChild(venueCell);
      tr.appendChild(entryCell);
      fixturesBody.appendChild(tr);
    });
  }

  /* ---------- Gallery page ---------- */
  var galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid && typeof NNPTGallery !== 'undefined') {
    var galleryModalOverlay = document.getElementById('galleryModalOverlay');
    var galleryModalImg = document.getElementById('galleryModalImg');
    var galleryModalLabel = document.getElementById('galleryModalLabel');
    var galleryModalCaption = document.getElementById('galleryModalCaption');
    var galleryModalClose = document.getElementById('galleryModalClose');

    function openGalleryModal(photo) {
      if (!galleryModalOverlay) return;
      galleryModalImg.src = photo.src;
      galleryModalImg.alt = photo.alt;
      galleryModalLabel.textContent = photo.label;
      galleryModalCaption.textContent = photo.caption;
      galleryModalOverlay.classList.add('active');
    }
    function closeGalleryModal() {
      if (!galleryModalOverlay) return;
      galleryModalOverlay.classList.remove('active');
    }
    if (galleryModalClose) galleryModalClose.addEventListener('click', closeGalleryModal);
    if (galleryModalOverlay) {
      galleryModalOverlay.addEventListener('click', function (e) {
        if (e.target === galleryModalOverlay) closeGalleryModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && galleryModalOverlay && galleryModalOverlay.classList.contains('active')) closeGalleryModal();
    });

    function renderGallery() {
      var photos = NNPTGallery.getAllPhotos();
      galleryGrid.innerHTML = '';
      photos.forEach(function (photo) {
        var card = document.createElement('div');
        card.className = 'gallery-card';

        var figure = document.createElement('button');
        figure.type = 'button';
        figure.className = 'gallery-card-figure';
        figure.setAttribute('aria-label', 'View ' + photo.label);
        figure.innerHTML = '<img src="' + photo.src + '" alt="' + photo.alt + '" loading="lazy">' +
          (photo.featured ? '<span class="gallery-badge">On Slideshow</span>' : '');
        figure.addEventListener('click', function () { openGalleryModal(photo); });

        var body = document.createElement('div');
        body.className = 'gallery-card-body';
        var label = document.createElement('p');
        label.className = 'gallery-card-label';
        label.textContent = photo.label;
        var toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'gallery-toggle-btn' + (photo.featured ? ' is-active' : '');
        toggleBtn.textContent = photo.featured ? '− Remove from Slideshow' : '+ Add to Slideshow';
        toggleBtn.addEventListener('click', function () {
          NNPTGallery.toggleFeatured(photo.id);
          renderGallery();
        });

        body.appendChild(label);
        body.appendChild(toggleBtn);
        card.appendChild(figure);
        card.appendChild(body);
        galleryGrid.appendChild(card);
      });
    }

    renderGallery();
  }

  /* ---------- Fallen Heroes data ----------
     Replace these placeholder records with real biodata as they
     become available. Each "id" matches a data-hero attribute
     on a .hero-btn button in the Fallen Heroes section.
  */
  var fallenHeroes = {
    "1": {
      name: "Aminu Mai",
      rank: "Captain",
      dob: "Placeholder — DD/MM/YYYY",
      dod: "2025",
      photo: "assets/img/capt-aminu-mai.jpg",
      bio: "Captain Aminu Mai was a familiar and much-loved face on the polo field, known as much for his sportsmanship as for his skill in the saddle. A dedicated player who represented the Navy with pride at club and inter-club fixtures, he brought warmth, humour, and an unmistakable love of the game to every match he played. His camaraderie on the field and his kindness off it are remembered fondly by teammates and opponents alike. He is deeply missed by the Nigerian Navy Polo Team, and his memory rides on with every chukka played in his honour."
    },
    "2": {
      name: "Name Placeholder II",
      rank: "Sub-Lieutenant",
      dob: "Placeholder — DD/MM/YYYY",
      dod: "Placeholder — DD/MM/YYYY",
      bio: "Biodata placeholder. Add this officer's service history, polo achievements, and a short tribute here once details are confirmed by the Team."
    },
    "3": {
      name: "Name Placeholder III",
      rank: "Petty Officer",
      dob: "Placeholder — DD/MM/YYYY",
      dod: "Placeholder — DD/MM/YYYY",
      bio: "Biodata placeholder. Add this officer's service history, polo achievements, and a short tribute here once details are confirmed by the Team."
    },
    "4": {
      name: "Name Placeholder IV",
      rank: "Lieutenant",
      dob: "Placeholder — DD/MM/YYYY",
      dod: "Placeholder — DD/MM/YYYY",
      bio: "Biodata placeholder. Add this officer's service history, polo achievements, and a short tribute here once details are confirmed by the Team."
    },
    "5": {
      name: "Name Placeholder V",
      rank: "Chief Petty Officer",
      dob: "Placeholder — DD/MM/YYYY",
      dod: "Placeholder — DD/MM/YYYY",
      bio: "Biodata placeholder. Add this officer's service history, polo achievements, and a short tribute here once details are confirmed by the Team."
    }
  };

  /* ---------- Fallen Heroes modal ---------- */
  var overlay = document.getElementById('heroModalOverlay');
  var closeBtn = document.getElementById('heroModalClose');
  var modalRank = document.getElementById('heroModalRank');
  var modalName = document.getElementById('heroModalName');
  var modalDob = document.getElementById('heroModalDob');
  var modalDod = document.getElementById('heroModalDod');
  var modalBio = document.getElementById('heroModalBio');
  var modalImg = document.getElementById('heroModalImg');
  var modalIcon = document.getElementById('heroModalIcon');
  var lastFocusedEl = null;

  function openHeroModal(id) {
    var hero = fallenHeroes[id];
    if (!hero || !overlay) return;

    modalRank.textContent = hero.rank;
    modalName.textContent = hero.name;
    modalDob.textContent = hero.dob;
    modalDod.textContent = hero.dod;
    modalBio.textContent = hero.bio;

    if (hero.photo) {
      modalImg.src = hero.photo;
      modalImg.alt = hero.name;
      modalImg.style.display = 'block';
      modalIcon.style.display = 'none';
    } else {
      modalImg.style.display = 'none';
      modalImg.src = '';
      modalIcon.style.display = 'block';
    }

    lastFocusedEl = document.activeElement;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeHeroModal() {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll('.hero-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openHeroModal(btn.getAttribute('data-hero'));
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeHeroModal);

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeHeroModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
      closeHeroModal();
    }
  });

  /* ---------- Trophies data ----------
     Replace these placeholder records with real trophy details as
     they are confirmed: the trophy's name, the year it was won, and
     the story of how it was won. Each "id" matches a data-trophy
     attribute on a .trophy-btn button in the Trophies page.
  */
  var trophies = {
    "1": {
      name: "Twilight Cup",
      year: "Year Placeholder",
      story: "Won by the Nigerian Navy Polo Team. Full match details — the host tournament, the opponents, and the standout moments — will be added once confirmed by the Team."
    },
    "2": {
      name: "Juma Cup",
      year: "Year Placeholder",
      story: "Won by the Nigerian Navy Polo Team. Full match details — the host tournament, the opponents, and the standout moments — will be added once confirmed by the Team."
    },
    "3": {
      name: "TY Danjuma Cup",
      year: "2022",
      story: "Won in the Nigerian Navy Polo Team's maiden appearance at the Port Harcourt International Polo Tournament — the young team's first major trophy, secured just a year after the team was established. The team returned in 2023 to successfully defend the title."
    },
    "4": {
      name: "O.B. Lulu Briggs Cup",
      year: "2023",
      story: "Won at the Port Harcourt International Polo Tournament, where the Navy fielded two teams and swept both the O.B. Lulu Briggs Cup and a successful defence of the TY Danjuma Cup in the same tournament."
    },
    "5": {
      name: "Trophy Name Placeholder V",
      year: "Year Placeholder",
      story: "Story placeholder. Add the details of how this trophy was won — the tournament, the opponents, and the standout moments — once confirmed by the Team."
    }
  };

  /* ---------- Trophy modal ---------- */
  var trophyOverlay = document.getElementById('trophyModalOverlay');
  var trophyCloseBtn = document.getElementById('trophyModalClose');
  var trophyModalYear = document.getElementById('trophyModalYear');
  var trophyModalName = document.getElementById('trophyModalName');
  var trophyModalStory = document.getElementById('trophyModalStory');
  var trophyLastFocusedEl = null;

  function openTrophyModal(id) {
    var trophy = trophies[id];
    if (!trophy || !trophyOverlay) return;

    trophyModalYear.textContent = trophy.year;
    trophyModalName.textContent = trophy.name;
    trophyModalStory.textContent = trophy.story;

    trophyLastFocusedEl = document.activeElement;
    trophyOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    trophyCloseBtn.focus();
  }

  function closeTrophyModal() {
    if (!trophyOverlay) return;
    trophyOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (trophyLastFocusedEl) trophyLastFocusedEl.focus();
  }

  document.querySelectorAll('.trophy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openTrophyModal(btn.getAttribute('data-trophy'));
    });
  });

  if (trophyCloseBtn) trophyCloseBtn.addEventListener('click', closeTrophyModal);

  if (trophyOverlay) {
    trophyOverlay.addEventListener('click', function (e) {
      if (e.target === trophyOverlay) closeTrophyModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && trophyOverlay && trophyOverlay.classList.contains('active')) {
      closeTrophyModal();
    }
  });

});
