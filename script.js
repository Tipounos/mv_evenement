/* ==========================================================================
   AIGLE BLANC DÉCORATION
   Script principal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroTypewriter();
  initCollectionsCarousel();
  initReviewsCarousel();
  initTrustMarqueeTouch();
  initGallerySlider();
  initInstagramVideos();
  initScrollReveal();
  document.getElementById('current-year').textContent = new Date().getFullYear();
});

/* ==========================================================================
   1. MENU MOBILE
   ========================================================================== */

function initMobileNav() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('main-nav');

  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  });

  // Ferme le menu quand on clique sur un lien
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   2. EFFET MACHINE À ÉCRIRE — TITRE DU HERO
   Écrit chaque mot lettre par lettre, l'efface, puis passe au mot suivant.
   ========================================================================== */

function initHeroTypewriter() {
  const el = document.getElementById('heroTypewriter');
  if (!el) return;

  // Liste des mots qui défilent (reprend les 4 prestations de la section Collections)
  const words = ['célébrations', 'événements', 'moments'];

  const TYPING_SPEED = 100;       // ms entre chaque lettre tapée
  const ERASING_SPEED = 60;      // ms entre chaque lettre effacée
  const PAUSE_AFTER_WORD = 1600; // ms de pause une fois le mot complet
  const PAUSE_BEFORE_NEXT = 300; // ms de pause une fois le mot effacé

  // Respecte les préférences d'accessibilité : pas d'animation, mot fixe
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    el.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const currentWord = words[wordIndex];

    if (!isDeleting) {
      // Phase d'écriture
      charIndex++;
      el.textContent = currentWord.slice(0, charIndex);

      if (charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(tick, PAUSE_AFTER_WORD);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    } else {
      // Phase d'effacement
      charIndex--;
      el.textContent = currentWord.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, PAUSE_BEFORE_NEXT);
        return;
      }
      setTimeout(tick, ERASING_SPEED);
    }
  }

  tick();
}

/* ==========================================================================
   3. CARROUSEL COLLECTIONS
   ========================================================================== */

function initCollectionsCarousel() {
  const track = document.querySelector('.carousel__track');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (!track || !prevBtn || !nextBtn) return;

  // Distance de défilement = largeur d'une carte + l'espacement (gap)
  function getScrollAmount() {
    const card = track.querySelector('.card');
    if (!card) return 300;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 24;
    return card.offsetWidth + gap;
  }

  // Active/désactive les flèches selon la position de défilement
  function updateArrowStates() {
    const { scrollLeft, scrollWidth, clientWidth } = track;
    const atStart = scrollLeft <= 5;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 5;

    prevBtn.classList.toggle('disabled', atStart);
    nextBtn.classList.toggle('disabled', atEnd);
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateArrowStates, { passive: true });
  window.addEventListener('resize', updateArrowStates);

  updateArrowStates();
}

/* ==========================================================================
   4. CARROUSEL AVIS CLIENTS (une carte visible, navigation par points)
   ========================================================================== */

function initReviewsCarousel() {
  const track = document.getElementById('reviewsTrack');
  const dotsWrap = document.getElementById('reviewsDots');

  if (!track || !dotsWrap) return;

  const cards = Array.from(track.children);
  if (cards.length === 0) return;

  // Une seule carte : pas besoin de carrousel ni de points
  if (cards.length === 1) {
    dotsWrap.style.display = 'none';
    return;
  }

  let index = 0;
  let autoplayId = null;
  const AUTOPLAY_DELAY = 6000;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Génère un point par avis
  const dots = cards.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'reviews__dot';
    dot.setAttribute('aria-label', `Voir l'avis ${i + 1}`);
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  function goTo(i, userTriggered) {
    index = (i + cards.length) % cards.length;
    render();
    if (userTriggered) restartAutoplay();
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    autoplayId = setInterval(() => goTo(index + 1), AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Support du swipe tactile
  let startX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(index - 1) : goTo(index + 1);
    }
    startAutoplay();
  });

  const carousel = track.closest('.reviews__carousel');
  carousel?.addEventListener('mouseenter', stopAutoplay);
  carousel?.addEventListener('mouseleave', startAutoplay);

  render();
  startAutoplay();
}

/* ==========================================================================
   5. LOGOS "ILS NOUS FONT CONFIANCE" — accélérer/ralentir au doigt (tactile)
   Le défilement automatique reste géré en CSS (@keyframes trust-scroll dans
   style.css). Au toucher, on met le CSS en pause et on prend la main :
   glisser accélère ou inverse le sens, puis au lâcher le bandeau ralentit
   progressivement (effet d'inertie) avant de reprendre sa vitesse normale.
   Ne se déclenche qu'au doigt : le comportement desktop (survol = pause,
   défilement auto) reste inchangé.
   ========================================================================== */

function initTrustMarqueeTouch() {
  const track = document.querySelector('.trust__track');
  if (!track) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const CSS_DURATION_MS = 26000; // doit rester égal à la durée de trust-scroll dans style.css
  const FRICTION = 0.95;         // ralentissement après le lâcher (inertie)
  const MIN_VELOCITY = 0.01;     // px/ms — en dessous, on redonne la main au CSS

  let halfWidth = track.scrollWidth / 2;
  window.addEventListener('resize', () => {
    halfWidth = track.scrollWidth / 2;
  });

  function getCurrentPosition() {
    const matrix = new DOMMatrixReadOnly(window.getComputedStyle(track).transform);
    return ((-matrix.m41 % halfWidth) + halfWidth) % halfWidth;
  }

  let position = 0;
  let velocity = 0; // px/ms
  let lastX = 0;
  let lastTime = 0;
  let momentumId = null;

  function applyPosition(p) {
    position = ((p % halfWidth) + halfWidth) % halfWidth;
    track.style.transform = `translateX(${-position}px)`;
  }

  function stopMomentum() {
    if (momentumId) cancelAnimationFrame(momentumId);
    momentumId = null;
  }

  function resumeCssAnimation() {
    const t = (position / halfWidth) * CSS_DURATION_MS;
    track.style.animationDelay = `-${t}ms`;
    track.style.animationPlayState = 'running';
    track.style.transform = '';
  }

  function runMomentum(prevTime) {
    momentumId = requestAnimationFrame((now) => {
      const dt = now - prevTime || 16;
      applyPosition(position + velocity * dt);
      velocity *= FRICTION;

      if (Math.abs(velocity) < MIN_VELOCITY) {
        stopMomentum();
        resumeCssAnimation();
        return;
      }
      runMomentum(now);
    });
  }

  track.addEventListener('touchstart', (e) => {
    stopMomentum();
    position = getCurrentPosition();
    track.style.animationPlayState = 'paused';
    applyPosition(position);

    lastX = e.touches[0].clientX;
    lastTime = performance.now();
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const x = e.touches[0].clientX;
    const now = performance.now();
    const dt = now - lastTime || 16;
    const dx = lastX - x; // glisser vers la gauche = avancer le défilement

    applyPosition(position + dx);
    velocity = dx / dt;

    lastX = x;
    lastTime = now;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (Math.abs(velocity) < MIN_VELOCITY) {
      resumeCssAnimation();
      return;
    }
    runMomentum(performance.now());
  });
}

/* ==========================================================================
   6. SLIDER GALERIE
   ========================================================================== */

function initGallerySlider() {
  const track = document.getElementById('gallery-track');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  if (!track) return;

  const slides = Array.from(track.children);
  let index = 0;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-index * 100}%)`;
  }

  prevBtn?.addEventListener('click', () => goTo(index - 1));
  nextBtn?.addEventListener('click', () => goTo(index + 1));

  // Support du swipe tactile
  let startX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(index - 1) : goTo(index + 1);
    }
  });
}

/* ==========================================================================
   7. LECTURE DES VIDÉOS INSTAGRAM
   ========================================================================== */

function initInstagramVideos() {
  document.querySelectorAll('.ig-card__media').forEach((card) => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.ig-card__play');

    if (!video || !playBtn) return;

    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        card.classList.add('is-playing');
      } else {
        video.pause();
        card.classList.remove('is-playing');
      }
    });

    video.addEventListener('click', () => {
      video.pause();
      card.classList.remove('is-playing');
    });
  });
}

/* ==========================================================================
   8. APPARITION AU SCROLL
   ========================================================================== */

function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.carousel, .reviews__widget, .reviews__carousel, .ig-card, .approach__inner, .section__title'
  );

  targets.forEach((el) => el.classList.add('reveal'));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}