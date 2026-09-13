/* ==========================================================================
   AIGLE BLANC DÉCORATION
   Script principal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroTypewriter();
  initCollectionsCarousel();
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
   4. SLIDER GALERIE
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
   5. LECTURE DES VIDÉOS INSTAGRAM
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
   6. APPARITION AU SCROLL
   ========================================================================== */

function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.carousel, .ig-card, .approach__inner, .review-card, .section__title'
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
