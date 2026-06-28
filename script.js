/* =============================================
   DevWithARat — script.js
   Libraries: Three.js · GSAP + ScrollTrigger · Locomotive Scroll · Anime.js · AOS
   ============================================= */

// ─────────────────────────────────────────────
// 1. THREE.JS — Floating particle background in hero
// ─────────────────────────────────────────────
function initThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  // Particle system — coral red + off-white dots
  const COUNT = 280;
  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);
  const sizes     = new Float32Array(COUNT);

  const red   = new THREE.Color('#E8554A');
  const white = new THREE.Color('#F5F0EB');

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

    const c = Math.random() < 0.25 ? red : white;
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  }, { passive: true });

  const clock = new THREE.Clock();
  (function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    particles.rotation.y = t * 0.025 + mouseX * 0.5;
    particles.rotation.x = Math.sin(t * 0.015) * 0.08 - mouseY * 0.3;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, { passive: true });
}

// ─────────────────────────────────────────────
// 2. LOCOMOTIVE SCROLL — smooth scroll engine
// ─────────────────────────────────────────────
let locoScroll;

function initLocomotiveScroll() {
  if (typeof LocomotiveScroll === 'undefined') return;

  locoScroll = new LocomotiveScroll({
    el: document.querySelector('#main-container'),
    smooth: true,
    multiplier: 0.9,
    lerp: 0.07,
    smartphone: { smooth: true },
    tablet:     { smooth: true, breakpoint: 1024 },
  });

  // Sync Locomotive's scroll position → GSAP ScrollTrigger
  locoScroll.on('scroll', ScrollTrigger.update);

  // Proxy so ScrollTrigger can read Locomotive's virtual scroll position
  ScrollTrigger.scrollerProxy('#main-container', {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector('#main-container').style.transform ? 'transform' : 'fixed',
  });

  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());

  // Also tell AOS to refresh when Locomotive scrolls
  locoScroll.on('scroll', () => AOS.refresh());
}

// ─────────────────────────────────────────────
// 3. GSAP HERO TIMELINE — entrance animation
// ─────────────────────────────────────────────
function initHeroGSAP() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });

  tl
    .to('.hero-eyebrow',  { opacity: 1, y: 0, duration: 0.5 }, 0.3)
    .fromTo('.hero-heading .word',
      { opacity: 0, y: 50, skewY: 4 },
      { opacity: 1, y: 0, skewY: 0, stagger: 0.12 },
      0.5
    )
    .to('.hero-sub',     { opacity: 1, y: 0 }, 0.95)
    .to('.hero-buttons', { opacity: 1, y: 0 }, 1.1)
    .to('.avatar-wrap',  { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)' }, 0.4)
    .to('.hero-badge',   { opacity: 1, y: 0, duration: 0.5 }, 1.2);
}

// ─────────────────────────────────────────────
// 4. GSAP SCROLL TRIGGERS — section animations
// ─────────────────────────────────────────────
function initScrollTriggers() {
  const scroller = '#main-container';

  // Section labels slide in
  gsap.utils.toArray('.section-label').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0, duration: 0.5,
        scrollTrigger: { trigger: el, scroller, start: 'top 88%' }
      }
    );
  });

  // About text
  gsap.fromTo('.about-text',
    { opacity: 0, x: -40 },
    {
      opacity: 1, x: 0, duration: 0.75,
      scrollTrigger: { trigger: '.about-text', scroller, start: 'top 80%' }
    }
  );

  // Section headings
  gsap.utils.toArray('.section-heading').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.65,
        scrollTrigger: { trigger: el, scroller, start: 'top 85%' }
      }
    );
  });

  // Skills grid — stagger
  gsap.to('.skill-card', {
    opacity: 1,
    y: 0,
    stagger: { each: 0.07, from: 'start' },
    duration: 0.55,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.skills-grid', scroller, start: 'top 78%' }
  });

  // Project cards — stagger
  gsap.to('.project-card', {
    opacity: 1,
    y: 0,
    stagger: 0.15,
    duration: 0.65,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.projects-grid', scroller, start: 'top 78%' }
  });

  // Contact section
  gsap.fromTo('.contact-text',
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.7,
      scrollTrigger: { trigger: '.contact-inner', scroller, start: 'top 80%' }
    }
  );
  gsap.fromTo('.contact-links',
    { opacity: 0, x: 40 },
    {
      opacity: 1, x: 0, duration: 0.7, delay: 0.15,
      scrollTrigger: { trigger: '.contact-inner', scroller, start: 'top 80%' }
    }
  );
}

// ─────────────────────────────────────────────
// 5. ANIME.JS — skill card hover spring animations
// ─────────────────────────────────────────────
function initAnimeJS() {
  if (typeof anime === 'undefined') return;

  document.querySelectorAll('.skill-card').forEach(card => {
    const icon = card.querySelector('.skill-icon');

    card.addEventListener('mouseenter', () => {
      anime({
        targets: icon,
        scale: [1, 1.2],
        rotate: [0, -8, 6, 0],
        duration: 500,
        easing: 'spring(1, 80, 12, 0)',
      });
      anime({
        targets: card.querySelector('.skill-tag'),
        translateX: [0, 4, 0],
        duration: 350,
        easing: 'easeOutElastic(1, .6)',
      });
    });

    card.addEventListener('mouseleave', () => {
      anime({
        targets: icon,
        scale: 1,
        rotate: 0,
        duration: 300,
        easing: 'easeOutCubic',
      });
    });
  });

  // Animate the rat icon in the nav with a wiggle on click
  const ratIcon = document.querySelector('.rat-icon');
  if (ratIcon) {
    ratIcon.addEventListener('click', () => {
      anime({
        targets: ratIcon,
        rotate: [0, -15, 12, -8, 5, 0],
        duration: 700,
        easing: 'easeInOutElastic(1, .5)',
      });
    });
  }
}

// ─────────────────────────────────────────────
// 6. AOS — about stat cards reveal
// ─────────────────────────────────────────────
function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 550,
    once: true,
    offset: 60,
    easing: 'ease-out-cubic',
  });
}

// ─────────────────────────────────────────────
// 7. NAV scroll state + smooth anchor clicks
// ─────────────────────────────────────────────
function initNav() {
  // Scrolled class for border
  if (locoScroll) {
    locoScroll.on('scroll', ({ scroll }) => {
      document.getElementById('navbar').classList.toggle('scrolled', scroll.y > 20);
    });
  } else {
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // Smooth anchor navigation via Locomotive
  document.querySelectorAll('[data-scroll-to]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(el.dataset.scrollTo);
      if (!target) return;
      if (locoScroll) {
        locoScroll.scrollTo(target, { offset: -80 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ─────────────────────────────────────────────
// BOOT — initialise everything in order
// ─────────────────────────────────────────────
(function boot() {
  // Register ScrollTrigger plugin
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.defaults({ scroller: '#main-container' });
  }

  // Three.js can start immediately (canvas is always ready)
  initThreeJS();

  // Wait for DOM to be fully painted
  window.addEventListener('load', () => {
    initLocomotiveScroll();
    initAOS();
    initHeroGSAP();
    initScrollTriggers();
    initAnimeJS();
    initNav();

    // Final refresh so all measurements are correct
    ScrollTrigger.refresh();
  });
})();
