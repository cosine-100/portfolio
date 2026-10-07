/**
 * Cosine Tech — Portfolio
 * main.js
 *
 * Table of contents
 *   1. Configuration (social links)
 *   2. Helpers
 *   3. Social links
 *   4. Navigation (mobile menu, shrink on scroll, progress bar)
 *   5. Scroll reveal
 *   6. Image lightbox (graphic design flyers)
 *   7. Video player (modal)
 *   8. Carousels (2 visible, first-in first-out)
 *   9. Boot
 */

"use strict";

/* ==========================================================================
   1. CONFIGURATION
   Paste your links here. WhatsApp only needs the number with country code.
   ========================================================================== */

const LINKS = {
  github: "https://github.com/cosine-100",
  linkedin: "https://www.linkedin.com/in/onwuegbunam-peter-5950a640b",
  facebook: "https://www.facebook.com/profile.php?id=100087129282462",
  instagram: "https://instagram.com/cosinetech_100",
  whatsapp: "2348022682138",
};

// Message that is pre-typed when a visitor opens the WhatsApp chat
const WHATSAPP_MESSAGE =
  "Hello, I saw your portfolio and I would like to talk.";

// Carousel behaviour
const CAROUSEL_INTERVAL = 3000; // ms between slides
const CAROUSEL_SLIDE_TIME = 950; // ms, must match the CSS transition on .tk
const CAROUSEL_MOBILE_BREAKPOINT = 600; // px, below this only one card shows

/* ==========================================================================
   2. HELPERS
   ========================================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ==========================================================================
   3. SOCIAL LINKS
   Every element with data-k="github | linkedin | facebook | instagram |
   whatsapp" receives its URL from the LINKS object above.
   ========================================================================== */

function buildWhatsAppUrl(value) {
  if (/^https?:/.test(value)) return value;
  const number = value.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

function initSocialLinks() {
  $$("[data-k]").forEach((link) => {
    const key = link.dataset.k;
    const value = (LINKS[key] || "").trim();
    if (!value) return; // no link provided: button stays disabled

    link.href = key === "whatsapp" ? buildWhatsAppUrl(value) : value;
    link.target = "_blank";
    link.rel = "noopener";
    link.removeAttribute("data-todo");
    link.removeAttribute("title");
  });
}

/* ==========================================================================
   4. NAVIGATION
   ========================================================================== */

function initNavigation() {
  const nav = $("nav");
  const menu = $(".links");
  const burger = $(".burger");
  const progressBar = $(".pg");

  // Mobile menu: open with the burger, close when a link is chosen
  burger.addEventListener("click", () => menu.classList.toggle("on"));
  $$("a", menu).forEach((a) =>
    a.addEventListener("click", () => menu.classList.remove("on")),
  );

  // Shrink the bar and update the progress line while scrolling
  const onScroll = () => {
    nav.classList.toggle("sm", window.scrollY > 40);

    const scrollable = document.body.scrollHeight - window.innerHeight;
    progressBar.style.width = `${(window.scrollY / scrollable) * 100}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ==========================================================================
   5. SCROLL REVEAL
   Adds .show to .rv elements (and carousels) when they enter the viewport.
   ========================================================================== */

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.05 },
  );

  $$(".rv, .js-carousel").forEach((el) => observer.observe(el));
}

/* ==========================================================================
   6. IMAGE LIGHTBOX
   Opens the flyers in a large dialog. Uses event delegation so that the
   cloned cards inside the carousels work as well.
   ========================================================================== */

function initLightbox() {
  const dialog = $("#lb");
  const image = $("img", dialog);
  const caption = $("p", dialog);
  const shots = $$(".shot");
  let current = 0;

  // Give each original flyer an index (clones inherit it)
  shots.forEach((shot, i) => (shot.dataset.i = i));

  const show = (i) => {
    current = (i + shots.length) % shots.length;
    const shot = shots[current];
    image.src = $("img", shot).src;
    caption.textContent = `${shot.dataset.c} · ${shot.dataset.t}`;
  };

  document.addEventListener("click", (event) => {
    const shot = event.target.closest(".shot");
    if (!shot) return;
    show(Number(shot.dataset.i));
    dialog.showModal();
  });

  $(".pv", dialog).addEventListener("click", () => show(current - 1));
  $(".nx", dialog).addEventListener("click", () => show(current + 1));

  document.addEventListener("keydown", (event) => {
    if (!dialog.open) return;
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
}

/* ==========================================================================
   7. VIDEO PLAYER
   The preview loops silently in the page; the full video loads only when the
   visitor clicks, which keeps the page light.
   ========================================================================== */

const FULL_VIDEO_SRC = "assets/video/cosine-video.mp4";

function initVideo() {
  const dialog = $("#vb");
  const player = $("video", dialog);
  const trigger = $(".vid");

  trigger.addEventListener("click", () => {
    if (!player.src) player.src = FULL_VIDEO_SRC;
    dialog.showModal();
    player.play().catch(() => {});
  });

  dialog.addEventListener("close", () => player.pause());

  // Autoplay previews must be muted to be allowed by browsers
  $$("video[autoplay]").forEach((video) => {
    video.muted = true;
    video.play().catch(() => {});
  });
}

/* ==========================================================================
   8. DIALOGS (shared close behaviour)
   ========================================================================== */

function initDialogs() {
  $$("dialog").forEach((dialog) => {
    $(".dx", dialog).addEventListener("click", () => dialog.close());
    // Click on the dark backdrop closes the dialog
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
}

/* ==========================================================================
   9. CAROUSELS
   Each .js-carousel row becomes a single-line track that shows two cards
   (one on phones). Every few seconds the first card leaves on the left and
   the next one enters from the right: first in, first out, forever.
   The first two cards are cloned at the end so the loop is seamless.
   ========================================================================== */

function createCarousel(row) {
  const isFlyers = row.classList.contains("fl");
  const items = [...row.children];
  const track = document.createElement("div");
  track.className = "tk";

  items.forEach((item) => track.appendChild(item));
  items.slice(0, 2).forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  row.className = `car rv${isFlyers ? " fl" : ""}`;
  row.appendChild(track);

  const carousel = { row, track, count: items.length, index: 0, paused: false };
  row.addEventListener("mouseenter", () => (carousel.paused = true));
  row.addEventListener("mouseleave", () => (carousel.paused = false));
  return carousel;
}

const visibleCards = () =>
  window.innerWidth > CAROUSEL_MOBILE_BREAKPOINT ? 2 : 1;
const stepSize = ({ track }) =>
  track.children[1].offsetLeft - track.children[0].offsetLeft;

function moveTo(carousel, animate = true) {
  const { track } = carousel;
  track.style.transition = animate ? "" : "none";
  track.style.transform = `translateX(${-carousel.index * stepSize(carousel)}px)`;
}

function advance(carousel) {
  carousel.index += 1;
  moveTo(carousel);

  // Briefly highlight the card that just entered
  const entering = carousel.track.children[carousel.index + visibleCards() - 1];
  if (entering) {
    entering.classList.add("hot");
    setTimeout(() => entering.classList.remove("hot"), 2500);
  }

  // After the clones have slid in, jump back to the start without animation
  if (carousel.index === carousel.count) {
    setTimeout(() => {
      carousel.index = 0;
      moveTo(carousel, false);
    }, CAROUSEL_SLIDE_TIME);
  }
}

function initCarousels() {
  const carousels = $$(".js-carousel").map(createCarousel);

  if (!prefersReducedMotion) {
    setInterval(() => {
      carousels.forEach((c) => {
        if (!c.paused && !document.hidden) advance(c);
      });
    }, CAROUSEL_INTERVAL);
  }

  window.addEventListener("resize", () =>
    carousels.forEach((c) => moveTo(c, false)),
  );
}

/* ==========================================================================
   10. BOOT
   Order matters: the lightbox indexes the original cards before the
   carousels clone them.
   ========================================================================== */

initSocialLinks();
initNavigation();
initScrollReveal();
initLightbox();
initVideo();
initDialogs();
initCarousels();
