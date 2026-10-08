/* ============================================================
   Nigerian Navy Polo Association — site scripts
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
    var summaryEl = document.getElementById('formErrorSummary');
    var photoInput = document.getElementById('aPhoto');
    var photoPreview = document.getElementById('photoPreview');
    var photoHint = document.getElementById('photoHint');
    var photoDataUrl = '';            // the processed JPEG that gets sent and printed on the slip
    var PHOTO_HINT_DEFAULT = photoHint ? photoHint.textContent : '';

    // payload key -> input id (also used to highlight fields the server rejects)
    var FIELD_IDS = {
      fullName: 'aFullName', email: 'aEmail', phone: 'aPhone', address: 'aAddress',
      dateOfBirth: 'aDob', sex: 'aSex', photo: 'aPhoto', tier: 'aTier', experience: 'aExperience',
      serviceNo: 'aServiceNo', rank: 'aRank', serviceStatus: 'aServiceStatus', command: 'aCommand',
      occupation: 'aOccupation', org: 'aOrg', sponsor: 'aSponsor', note: 'aNote'
    };
    var TYPE_FIELDS = {
      serviceman: ['aServiceNo', 'aRank', 'aServiceStatus', 'aCommand'],
      civilian: ['aOccupation', 'aOrg', 'aSponsor']
    };

    /* ----- date of birth can't be in the future ----- */
    function todayISO() {
      var d = new Date();
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }
    var dobInput = document.getElementById('aDob');
    if (dobInput) dobInput.max = todayISO();

    /* ----- field error helpers ----- */
    function fieldWrap(el) { return el.closest('.field, .check-field'); }

    function setFieldError(el, msg) {
      var wrap = fieldWrap(el);
      if (!wrap) return;
      wrap.classList.add('has-error');
      el.setAttribute('aria-invalid', 'true');
      var err = wrap.querySelector('.field-error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        wrap.appendChild(err);
      }
      err.textContent = msg;
    }

    function clearFieldError(el) {
      var wrap = fieldWrap(el);
      if (!wrap) return;
      wrap.classList.remove('has-error');
      el.removeAttribute('aria-invalid');
      var err = wrap.querySelector('.field-error');
      if (err) err.textContent = '';
    }

    function markRequired(el) {
      var wrap = fieldWrap(el);
      if (wrap && wrap.classList.contains('field')) wrap.classList.toggle('is-required', el.required);
    }

    // returns an error message, or '' if the field is fine
    function fieldMessage(el) {
      if (el.type === 'checkbox') return el.checked ? '' : 'Please tick this box to confirm.';
      if (el.id === 'aPhoto') return photoDataUrl ? '' : 'Please add your passport photograph.';

      var val = (el.value || '').trim();
      if (!val) return el.tagName === 'SELECT' ? 'Please choose an option.' : 'This field is required.';

      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address.';
      if (el.type === 'tel') {
        var digits = val.replace(/\D/g, '');
        if (!/^[+()\-.\s\d]+$/.test(val) || digits.length < 7 || digits.length > 15) return 'Enter a valid phone number.';
      }
      if (el.type === 'date') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val) || isNaN(new Date(val + 'T00:00:00').getTime())) return 'Enter a valid date.';
        if (val > todayISO()) return 'Date of birth cannot be in the future.';
        if (val < '1900-01-01') return 'Enter a valid date of birth.';
      }
      return '';
    }

    function refreshSummary() {
      if (!summaryEl) return;
      var n = membershipForm.querySelectorAll('.has-error').length;
      if (!n) { summaryEl.hidden = true; summaryEl.textContent = ''; return; }
      summaryEl.hidden = false;
      summaryEl.textContent = n === 1
        ? 'Your application can\'t be submitted yet — 1 field still needs your attention (highlighted above).'
        : 'Your application can\'t be submitted yet — ' + n + ' fields still need your attention (highlighted above).';
    }

    // checks every visible required field. returns true only if the whole form is complete.
    function validateForm() {
      var first = null;
      membershipForm.querySelectorAll('[required]').forEach(function (el) {
        if (el.offsetParent === null) { clearFieldError(el); return; }   // belongs to the other applicant type
        var msg = fieldMessage(el);
        if (msg) { setFieldError(el, msg); if (!first) first = el; }
        else clearFieldError(el);
      });
      refreshSummary();
      if (first) {
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { first.focus({ preventScroll: true }); } catch (err) { first.focus(); }
        return false;
      }
      return true;
    }

    // once a field has been flagged, re-check it as the person fixes it
    function recheck(e) {
      var el = e.target;
      if (!el || !el.required || el.id === 'aPhoto') return;
      var wrap = fieldWrap(el);
      if (!wrap || !wrap.classList.contains('has-error')) return;
      var msg = fieldMessage(el);
      if (msg) setFieldError(el, msg); else clearFieldError(el);
      refreshSummary();
    }
    membershipForm.addEventListener('input', recheck);
    membershipForm.addEventListener('change', recheck);

    /* ----- naval personnel vs civilian ----- */
    function syncApplicantType() {
      var selected = membershipForm.querySelector('input[name="applicantType"]:checked');
      var value = selected ? selected.value : 'serviceman';
      membershipForm.classList.remove('show-serviceman', 'show-civilian');
      membershipForm.classList.add(value === 'civilian' ? 'show-civilian' : 'show-serviceman');

      // every field in the block that's showing is mandatory; the hidden block's fields are not
      Object.keys(TYPE_FIELDS).forEach(function (type) {
        TYPE_FIELDS[type].forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          el.required = (type === value);
          if (type !== value) clearFieldError(el);
          markRequired(el);
        });
      });
      refreshSummary();
    }

    typeRadios.forEach(function (radio) {
      radio.addEventListener('change', syncApplicantType);
    });
    membershipForm.querySelectorAll('[required]').forEach(markRequired);
    syncApplicantType();

    /* ----- passport photo: shrink to a print-ready JPEG, preview it exactly as it will be cropped ----- */
    function prepareApplicantPhoto(file) {
      return new Promise(function (resolve, reject) {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
          return reject(new Error('Please choose a JPG, PNG or WebP photo.'));
        }
        if (file.size > 15 * 1024 * 1024) {
          return reject(new Error('That photo is too large. Please choose one under 15 MB.'));
        }
        var url = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function () {
          URL.revokeObjectURL(url);
          var w = img.naturalWidth, h = img.naturalHeight;
          if (Math.min(w, h) < 200) {
            return reject(new Error('That photo is too small to print clearly. Please use one at least 200 × 200 pixels.'));
          }
          var scale = Math.min(1, 900 / Math.max(w, h));
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';                      // PNG transparency -> white, not black
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = function () {
          URL.revokeObjectURL(url);
          reject(new Error('We couldn\'t read that image. Please try a different photo.'));
        };
        img.src = url;
      });
    }

    function resetPhotoPreview() {
      photoDataUrl = '';
      if (photoPreview) photoPreview.innerHTML = '<span>No photo<br>selected</span>';
      if (photoHint) { photoHint.textContent = PHOTO_HINT_DEFAULT; photoHint.classList.remove('is-ok'); }
    }

    if (photoInput) {
      photoInput.addEventListener('change', function () {
        var file = photoInput.files && photoInput.files[0];
        resetPhotoPreview();
        if (!file) return;
        if (photoHint) photoHint.textContent = 'Preparing your photo…';
        prepareApplicantPhoto(file).then(function (dataUrl) {
          photoDataUrl = dataUrl;
          if (photoPreview) {
            photoPreview.innerHTML = '';
            var thumb = document.createElement('img');
            thumb.src = dataUrl;
            thumb.alt = 'Your passport photograph preview';
            photoPreview.appendChild(thumb);
          }
          if (photoHint) {
            photoHint.textContent = 'Photo added. This is how it will appear on your membership slip.';
            photoHint.classList.add('is-ok');
          }
          clearFieldError(photoInput);
          refreshSummary();
        }).catch(function (err) {
          photoInput.value = '';
          resetPhotoPreview();
          setFieldError(photoInput, err.message);
          refreshSummary();
        });
      });
    }

    /* ----- success popup ----- */
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

    /* ----- submit ----- */
    membershipForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('applyNote');
      var btn = document.getElementById('applySubmit');

      // nothing is sent until every visible field is complete
      if (!validateForm()) {
        if (note) note.textContent = 'Please complete every highlighted field before submitting.';
        return;
      }

      var selectedType = membershipForm.querySelector('input[name="applicantType"]:checked');
      var payload = { applicantType: selectedType ? selectedType.value : 'serviceman' };
      Object.keys(FIELD_IDS).forEach(function (key) {
        if (key === 'photo') return;
        var el = document.getElementById(FIELD_IDS[key]);
        payload[key] = el ? (el.value || '').trim() : '';
      });
      payload.photo = photoDataUrl;

      if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (!res.ok) {
              var err = new Error(data.error || 'Submission failed');
              err.fields = data.fields || null;
              err.status = res.status;
              throw err;
            }
            return data;
          });
        })
        .then(function () {
          if (note) note.textContent = 'Thank you — your application has been received. The secretariat will contact you within 5–7 working days.';
          if (btn) { btn.textContent = 'Application Submitted'; }
          openSubmitModal();
        })
        .catch(function (err) {
          if (btn) { btn.disabled = false; btn.textContent = 'Submit Application'; }
          // the server found something incomplete/invalid: highlight it just like the browser check does
          if (err && err.fields) {
            var first = null;
            Object.keys(err.fields).forEach(function (key) {
              var el = document.getElementById(FIELD_IDS[key]);
              if (!el) return;
              setFieldError(el, err.fields[key]);
              if (!first) first = el;
            });
            refreshSummary();
            if (note) note.textContent = 'Please correct the highlighted fields and submit again.';
            if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
          if (note) note.textContent = 'We couldn\'t submit this automatically. Please email your details to secretariat@nnpolo.org and the secretariat will follow up directly.';
        });
    });
  }

  /* ---------- Home page featured slideshow ---------- */
  var slideshow = document.getElementById('featuredSlideshow');

  // The secretariat picks the slideshow photos in the admin dashboard and the choice is saved on
  // the server. If it can't be reached quickly, the defaults in gallery-data.js are used instead.
  function loadSlideshowIds() {
    return new Promise(function (resolve) {
      var done = false;
      function finish(ids) { if (!done) { done = true; clearTimeout(timer); resolve(ids); } }
      var timer = setTimeout(function () { finish(null); }, 3000);
      fetch('/api/slideshow')
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) { finish(data && Array.isArray(data.ids) ? data.ids : null); })
        .catch(function () { finish(null); });
    });
  }

  if (slideshow) {
    loadSlideshowIds().then(setupSlideshow);
  }

  function setupSlideshow(savedIds) {
    // Populate slides from the shared Gallery data. Falls back to whatever
    // static slides are already in the markup if gallery data isn't loaded.
    if (typeof NNPTGallery !== 'undefined') {
      var featuredPhotos = NNPTGallery.getFeaturedPhotos(savedIds);
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
        figure.innerHTML = '<img src="' + photo.src + '" alt="' + photo.alt + '" loading="lazy">';
        figure.addEventListener('click', function () { openGalleryModal(photo); });

        var body = document.createElement('div');
        body.className = 'gallery-card-body';
        var label = document.createElement('p');
        label.className = 'gallery-card-label';
        label.textContent = photo.label;
        body.appendChild(label);
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
      bio: "Captain Aminu Mai was a familiar and much-loved face on the polo field, known as much for his sportsmanship as for his skill in the saddle. A dedicated player who represented the Navy with pride at club and inter-club fixtures, he brought warmth, humour, and an unmistakable love of the game to every match he played. His camaraderie on the field and his kindness off it are remembered fondly by teammates and opponents alike. He is deeply missed by the Nigerian Navy Polo Association, and his memory rides on with every chukka played in his honour."
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
      story: "Won by the Nigerian Navy Polo Association. Full match details — the host tournament, the opponents, and the standout moments — will be added once confirmed by the Team."
    },
    "2": {
      name: "Juma Cup",
      year: "Year Placeholder",
      story: "Won by the Nigerian Navy Polo Association. Full match details — the host tournament, the opponents, and the standout moments — will be added once confirmed by the Team."
    },
    "3": {
      name: "TY Danjuma Cup",
      year: "2022",
      story: "Won in the Nigerian Navy Polo Association's maiden appearance at the Port Harcourt International Polo Tournament — the young team's first major trophy, secured just a year after the team was established. The team returned in 2023 to successfully defend the title."
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
