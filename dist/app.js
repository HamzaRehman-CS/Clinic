const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (window.Lenis && !reduceMotion) {
  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    anchors: true
  });
  window.siteLenis = lenis;

  if (window.gsap && window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(t) {
      lenis.raf(t);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.header nav');

menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('open', open);
});

nav.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open menu');
  })
);

if (window.gsap && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero-line', {
    y: 55,
    opacity: 0,
    filter: 'blur(12px)',
    duration: 1.4,
    stagger: 0.13,
    ease: 'power3.out',
    delay: 0.15
  });

  gsap.from('.hero-in', {
    y: 18,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    delay: 0.55
  });

  gsap.from('.hero-bottom', {
    y: 20,
    opacity: 0,
    duration: 1.1,
    delay: 0.8
  });

  gsap.utils.toArray('.reveal').forEach((el) =>
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 1,
      scrollTrigger: { trigger: el, start: 'top 92%' }
    })
  );

  gsap.utils.toArray('.blur-reveal').forEach((el) =>
    gsap.from(el, {
      y: 25,
      filter: 'blur(13px)',
      opacity: 0.15,
      duration: 1.2,
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        end: 'top 50%',
        scrub: 1
      }
    })
  );
}

const dialog = document.querySelector('#detail-dialog');
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      dialog.close();
    }
  }
});

dialog.addEventListener('close', () => window.siteLenis?.start());

function openDialog(label, title, body) {
  document.querySelector('#dialog-label').textContent = label;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-body').innerHTML = body;
  dialog.showModal();
  window.siteLenis?.stop();
}

document.querySelector('[data-privacy]').addEventListener('click', () =>
  openDialog(
    'YOUR PRIVACY',
    'Your details stay with you.',
    '<p>This is a fictional clinic concept running locally. It does not use analytics, advertising cookies or a patient database.</p><p>The consultation form does not transmit or store your information. Please do not enter sensitive medical details.</p>'
  )
);

document
  .querySelector('[data-form-privacy]')
  .addEventListener('click', () => document.querySelector('[data-privacy]').click());

const care = [
  {
    title: 'Preventive health checks',
    intro:
      'A thoughtful place to begin, whether you have a question or simply want to understand your health better.',
    items: [
      'A conversation about your health history and priorities',
      'A review of relevant preventive checks',
      'A clear plan, made together with your doctor'
    ]
  },
  {
    title: 'Advanced diagnostics',
    intro:
      'Useful answers start with the right questions. Your doctor will discuss which investigations may be appropriate for you.',
    items: [
      'A personalised assessment before testing',
      'Coordination of relevant imaging and laboratory work',
      'A follow-up conversation to make sense of your results'
    ]
  },
  {
    title: 'Genetic insights',
    intro:
      'Understand what genetic information may mean for you, with space to consider the benefits and limitations before deciding.',
    items: [
      'A discussion of your personal and family history',
      'Guidance on whether genetic testing is appropriate',
      'Support interpreting results and considering next steps'
    ]
  },
  {
    title: 'Specialist consultations',
    intro: 'Connected expertise, built around the bigger picture of your health.',
    items: [
      'A review of your concerns and existing records',
      'Coordination with the appropriate specialist',
      'A shared care plan with your primary doctor'
    ]
  },
  {
    title: 'Ongoing health support',
    intro:
      'Care continues after the appointment. Your plan can adapt as your needs and priorities change.',
    items: [
      'Follow-up appointments with a familiar team',
      'Reviews of your agreed health plan',
      'Support preparing for your next stage of care'
    ]
  }
];

document.querySelectorAll('[data-detail]').forEach((button) =>
  button.addEventListener('click', () => {
    const item = care[Number(button.dataset.detail)];
    openDialog(
      'OUR CARE',
      item.title,
      `<p>${item.intro}</p><ul class="dialog-list">${item.items
        .map((x) => `<li>${x}</li>`)
        .join('')}</ul><a class="button primary dialog-book" href="#contact">Discuss your care <span>↗</span></a>`
    );
    document.querySelector('.dialog-book').addEventListener('click', () => {
      document.querySelector('#interest').value = item.title;
      dialog.close();
    });
  })
);

const doctors = [
  {
    name: 'Dr. Elara Voss',
    specialty: 'Preventive & family medicine',
    image: 'doctor-elara.jpg',
    bio: 'Elara’s approach begins with listening: understanding your everyday life, your concerns and the future you want for your health. Her focus is on preventive care and a lasting relationship with your family doctor.'
  },
  {
    name: 'Dr. James Arden',
    specialty: 'Internal medicine',
    image: 'doctor-james.jpg',
    bio: 'James brings a considered approach to complex health questions, connecting symptoms, investigations and your wider history. He believes a good consultation ends with a shared understanding and a clear next step.'
  }
];

document.querySelectorAll('[data-doctor]').forEach((button) =>
  button.addEventListener('click', () => {
    const d = doctors[Number(button.dataset.doctor)];
    openDialog(
      d.specialty,
      d.name,
      `<img class="dialog-doctor-image" src="/assets/${d.image}" alt="Illustrative doctor portrait"><p>${d.bio}</p><p><small>Fictional profile · Stock portrait used for this website concept.</small></p><a class="button primary dialog-book" href="#contact">Plan a first conversation <span>↗</span></a>`
    );
    document.querySelector('.dialog-book').addEventListener('click', () => dialog.close());
  })
);

const viewport = document.querySelector('.service-viewport');
const prev = document.querySelector('#services-prev');
const next = document.querySelector('#services-next');
let serviceScroll;

function updateRail() {
  prev.disabled = viewport.scrollLeft < 5;
  next.disabled = viewport.scrollLeft > viewport.scrollWidth - viewport.clientWidth - 5;
}

function moveServices(left) {
  const max = viewport.scrollWidth - viewport.clientWidth;
  const target = Math.max(0, Math.min(left, max));
  if (serviceScroll && max > 0) {
    // Map target to the active 72% segment of the scroll timeline
    const progress = (target / max) * 0.72;
    const y = serviceScroll.start + progress * (serviceScroll.end - serviceScroll.start);
    if (window.siteLenis) window.siteLenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: 'smooth' });
  } else {
    viewport.scrollTo({ left: target, behavior: reduceMotion ? 'instant' : 'smooth' });
  }
}

prev.addEventListener('click', () => moveServices(viewport.scrollLeft - viewport.clientWidth * 0.75));
next.addEventListener('click', () => moveServices(viewport.scrollLeft + viewport.clientWidth * 0.75));
viewport.addEventListener('scroll', updateRail, { passive: true });
new ResizeObserver(updateRail).observe(viewport);
updateRail();

document.querySelectorAll('[data-service]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const card = document.querySelectorAll('.service-card')[Number(a.dataset.service)];
    if (serviceScroll) {
      e.preventDefault();
      e.stopPropagation();
    }
    moveServices(card.offsetLeft - viewport.firstElementChild.offsetLeft);
  })
);

document.querySelector('#consultation-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const status = document.querySelector('.form-status');
  status.textContent =
    'Your preview is complete. On a connected clinic website, the care team would receive your request here. No details have been sent or saved.';
  status.focus();
  e.target.reset();
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.header nav a').forEach((a) => {
          const active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', active);
          if (active) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      }
    });
  },
  { rootMargin: '-20% 0px -60% 0px' }
);

document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open menu');
  }
});

if (window.gsap && !reduceMotion) {
  gsap.utils.toArray('.clinic-photo img').forEach((img) =>
    gsap.fromTo(
      img,
      { scale: 1.04, transformOrigin: 'center 16%' },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    )
  );

  gsap.from('.doctor-card', {
    y: 65,
    opacity: 0,
    stagger: 0.15,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.team', start: 'top 85%' }
  });

  ScrollTrigger.refresh();
}

if (window.gsap && !reduceMotion) {
  const services = document.querySelector('.services');

  gsap.from('.services .section-heading', {
    y: 25,
    opacity: 0,
    duration: 1,
    scrollTrigger: { trigger: '.services', start: 'top 85%' }
  });

  const isDesktop = window.matchMedia('(min-width:769px)').matches;
  if (isDesktop) {
    const maxScroll = () => viewport.scrollWidth - viewport.clientWidth;
    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'services-horizontal',
        trigger: services,
        start: 'top 10px',
        end: () => '+=' + Math.max(900, Math.round(maxScroll() * 1.6)),
        pin: true,
        pinSpacing: true,
        anticipatePin: 0,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: updateRail
      }
    });

    // 1. Smooth horizontal scroll through cards (0% -> 72% of scroll distance)
    tl.to(viewport, {
      scrollLeft: maxScroll,
      ease: 'none',
      duration: 0.72
    });

    // 2. Dwell / buffer pause on the final card (72% -> 100% of scroll distance)
    // Lets user digest the final card before unpinning to Section 4
    tl.to({}, {
      duration: 0.28,
      ease: 'none'
    });

    serviceScroll = tl.scrollTrigger;
  } else {
    viewport.style.overflowX = 'auto';
    viewport.style.scrollSnapType = 'x mandatory';
    document.querySelectorAll('.service-card').forEach((c) => (c.style.scrollSnapAlign = 'start'));
  }

  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
