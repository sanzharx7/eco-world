const scenes = [...document.querySelectorAll('[data-scene]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const progressBar = document.getElementById('progressBar');
const revealEls = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal-анимации с каскадной задержкой: элементы входят в кадр один за другим.
revealEls.forEach((el, index) => {
  el.style.setProperty('--reveal-delay', `${(index % 5) * 90}ms`);
  if (index % 2 === 0) el.classList.add('from-left');
  else el.classList.add('from-right');
});
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const index = scenes.indexOf(entry.target);
    navLinks.forEach((link, i) => link.classList.toggle('active', i === index));
    // При входе в каждый раздел запускается отдельная анимация его визуальных элементов.
    entry.target.classList.remove('scene-active');
    requestAnimationFrame(() => entry.target.classList.add('scene-active'));
  });
}, { threshold: 0.38 });
scenes.forEach(scene => sectionObserver.observe(scene));

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

function goToScene(direction) {
  const current = scenes.reduce((best, scene, i) => {
    const distance = Math.abs(scene.getBoundingClientRect().top);
    return distance < best.distance ? { index: i, distance } : best;
  }, { index: 0, distance: Infinity }).index;
  const next = Math.max(0, Math.min(scenes.length - 1, current + direction));
  scenes[next].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}
document.getElementById('prevScene').addEventListener('click', () => goToScene(-1));
document.getElementById('nextScene').addEventListener('click', () => goToScene(1));

const menuToggle = document.getElementById('menuToggle');
const sideNav = document.getElementById('sideNav');
menuToggle.addEventListener('click', () => {
  const open = sideNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
navLinks.forEach(link => link.addEventListener('click', () => {
  sideNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const checks = [...document.querySelectorAll('.check-row input')];
const doneCount = document.getElementById('doneCount');
const counterFill = document.getElementById('counterFill');
function updateChecklist() {
  const count = checks.filter(check => check.checked).length;
  doneCount.textContent = count;
  counterFill.style.width = `${count / checks.length * 100}%`;
}
checks.forEach(check => check.addEventListener('change', updateChecklist));
updateChecklist();

if (!reduceMotion) {
  const parallaxItems = document.querySelectorAll('.parallax');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      parallaxItems.forEach(item => {
        const speed = Number(item.dataset.speed || 0.1);
        const rect = item.parentElement.getBoundingClientRect();
        item.style.backgroundPosition = `center calc(48% + ${-rect.top * speed}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
}

document.addEventListener('keydown', event => {
  if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(document.activeElement.tagName)) return;
  if (event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); goToScene(1); }
  if (event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); goToScene(-1); }
});
