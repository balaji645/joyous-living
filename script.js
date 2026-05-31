// =====================================================
// Joyous Living — interactions
// =====================================================

// Nav background on scroll
const nav = document.querySelector('.nav');
const onScroll = () => {
  if (window.scrollY > 20) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById('navBurger');
const links = document.getElementById('navLinks');
burger?.addEventListener('click', () => links.classList.toggle('open'));
links?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => links.classList.remove('open'))
);

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Stagger timeline items
document.querySelectorAll('.timeline__item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 80}ms`;
});

// Stagger cards
document.querySelectorAll('.cards .card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 120}ms`;
});

// Register form handler (stub — wire up to a real endpoint later)
const form = document.getElementById('registerForm');
const note = document.getElementById('formNote');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.name || !data.email) return;
  note.textContent = `Thank you, ${data.name.split(' ')[0]}. We'll reach out to ${data.email} soon.`;
  form.reset();
  setTimeout(() => (note.textContent = ''), 6000);
});

// Q&A form handler — opens email client with the question pre-filled.
// Swap this for a Formspree/Netlify/Supabase call when you're ready.
const qaForm = document.getElementById('qaForm');
const qaNote = document.getElementById('qaNote');
qaForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(qaForm).entries());
  if (!data.name || !data.email || !data.question) return;

  const subject = encodeURIComponent(`Question from ${data.name} — Joyous Living`);
  const bodyLines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Share anonymously: ${data.anonymous ? 'Yes' : 'No'}`,
    '',
    'Question:',
    data.question,
  ];
  const body = encodeURIComponent(bodyLines.join('\n'));
  window.location.href = `mailto:balaji@joyousliving.org?subject=${subject}&body=${body}`;

  qaNote.textContent = `Thank you, ${data.name.split(' ')[0]} — your email client will open to send your question.`;
  qaForm.reset();
  setTimeout(() => (qaNote.textContent = ''), 8000);
});

// Render Q&A list from content/qa.json so it's editable via the CMS
const qaAccordion = document.getElementById('qaAccordion');

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderQaItem({ question, answer, author }) {
  return `
    <details class="qa-item">
      <summary>
        <span class="qa-item__q">${escapeHtml(question)}</span>
        <span class="qa-item__icon" aria-hidden="true"></span>
      </summary>
      <div class="qa-item__a">
        <p>${escapeHtml(answer)}</p>
        ${author ? `<span class="qa-item__by">— ${escapeHtml(author)}</span>` : ''}
      </div>
    </details>
  `;
}

function wireAccordion(root) {
  // Single-open behavior: close siblings when one opens
  root.querySelectorAll('.qa-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        root.querySelectorAll('.qa-item').forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // Reveal on scroll for the rendered items
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });
  root.querySelectorAll('.qa-item').forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
}

if (qaAccordion) {
  fetch('content/qa.json', { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const items = Array.isArray(data?.items) ? data.items : [];
      if (!items.length) {
        qaAccordion.innerHTML = '<p class="qa__loading">No questions answered yet — be the first to ask.</p>';
        return;
      }
      qaAccordion.innerHTML = items.map(renderQaItem).join('');
      wireAccordion(qaAccordion);
    })
    .catch(() => {
      qaAccordion.innerHTML = '<p class="qa__loading">Questions couldn\'t load right now. Please try again shortly.</p>';
    });
}
