// winikAnimations.js — One-page effects: particles, tilt, parallax, scroll spy, GSAP

gsap.registerPlugin(ScrollTrigger);

// ── Navbar scroll state ───────────────────────────────────────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
    ScrollTrigger.create({
        start: 80,
        onEnter:     () => navbar.classList.add('scrolled'),
        onLeaveBack: () => navbar.classList.remove('scrolled'),
    });
}

// ── Scroll spy for nav links ──────────────────────────────────────────────────
const navSections = document.querySelectorAll('section[id]');
const navLinks    = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');

function setActiveNav(id) {
    navLinks.forEach(link => {
        link.classList.remove('spy-active');
        if (link.getAttribute('href') === '#' + id) {
            link.classList.add('spy-active');
        }
    });
}

navSections.forEach(section => {
    ScrollTrigger.create({
        trigger: section,
        start:   'top 60%',
        end:     'bottom 60%',
        onEnter:     () => setActiveNav(section.id),
        onEnterBack: () => setActiveNav(section.id),
    });
});

// ── Hero entrance ─────────────────────────────────────────────────────────────
const heroContent = document.querySelector('.heroFullContent');
if (heroContent) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.heroEyebrow',      { opacity: 0, y: 20, duration: 0.7 })
      .from('.heroTitle',        { opacity: 0, y: 32, duration: 0.8 }, '-=0.4')
      .from('.heroSubtitle',     { opacity: 0, y: 24, duration: 0.7 }, '-=0.5')
      .from('.heroCtaGroup',     { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('.scrollIndicator',  { opacity: 0, duration: 0.8 },        '-=0.2');
}

// ── Section label reveals ─────────────────────────────────────────────────────
document.querySelectorAll('.sectionLabel').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: -24, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
    });
});

// ── Section header reveals ────────────────────────────────────────────────────
document.querySelectorAll('.sectionHeader h2, .sectionHeader h3').forEach(el => {
    gsap.from(el, {
        opacity: 0, y: 28, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
    });
});

// ── Card stagger: standList ───────────────────────────────────────────────────
document.querySelectorAll('.standList').forEach(list => {
    const items = gsap.utils.toArray(list.children);
    if (!items.length) return;
    gsap.from(items, {
        opacity: 0, y: 48, scale: 0.95,
        duration: 0.65, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: list, start: 'top 85%', toggleActions: 'play none none none' },
    });
});

// ── Aside section reveals ─────────────────────────────────────────────────────
document.querySelectorAll('.asideRight .asideImage').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: -48, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
});

document.querySelectorAll('.asideRight .asideStory').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: 48, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
});

document.querySelectorAll('.asideLeft .asideImage').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: 48, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
});

document.querySelectorAll('.asideLeft .asideStory').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: -48, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
});

// ── Parallax on sectionImage backgrounds ─────────────────────────────────────
document.querySelectorAll('.sectionImage').forEach(el => {
    gsap.to(el, {
        backgroundPositionY: '25%',
        ease: 'none',
        scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end:   'bottom top',
            scrub: true,
        },
    });
});

// ── GSAP generic reveal classes ───────────────────────────────────────────────
// Use IntersectionObserver so reveals work regardless of how the section is reached
(function setupRevealObserver() {
    const revealMap = new Map([
        ['.gsap-reveal',       { y: 32 }],
        ['.gsap-reveal-left',  { x: -48 }],
        ['.gsap-reveal-right', { x: 48 }],
    ]);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const fromVars = el._revealFrom || { y: 32 };
            gsap.fromTo(el,
                { opacity: 0, ...fromVars },
                { opacity: 1, x: 0, y: 0, duration: 0.8, ease: 'power2.out' }
            );
            observer.unobserve(el);
        });
    }, { threshold: 0.08 });

    revealMap.forEach((fromVars, selector) => {
        document.querySelectorAll(selector).forEach(el => {
            el._revealFrom = fromVars;
            gsap.set(el, { opacity: 0, ...fromVars });
            observer.observe(el);
        });
    });
})();

// ── particles.js hero background ─────────────────────────────────────────────
if (document.getElementById('particles-js') && typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        particles: {
            number: { value: 70, density: { enable: true, value_area: 900 } },
            color: { value: '#4DC8F5' },
            shape: { type: 'circle' },
            opacity: { value: 0.25, random: true, anim: { enable: true, speed: 0.6, opacity_min: 0.05 } },
            size: { value: 2.5, random: true },
            line_linked: {
                enable: true, distance: 160,
                color: '#4DC8F5', opacity: 0.12, width: 1,
            },
            move: {
                enable: true, speed: 1.2, direction: 'none',
                random: true, straight: false, out_mode: 'out', bounce: false,
            },
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'grab' },
                onclick: { enable: true, mode: 'push' },
            },
            modes: {
                grab:  { distance: 160, line_linked: { opacity: 0.4 } },
                push:  { particles_nb: 3 },
            },
        },
        retina_detect: true,
    });
}

// ── vanilla-tilt 3D cards ─────────────────────────────────────────────────────
if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
        max:          8,
        speed:        400,
        glare:        true,
        'max-glare':  0.12,
        perspective:  1200,
        scale:        1.03,
    });
}

// ── Smooth hash navigation (close mobile menu after clicking anchor link) ─────
document.querySelectorAll('.navbar-nav .nav-link, .dropdown-item').forEach(link => {
    link.addEventListener('click', () => {
        const toggle = document.querySelector('.navbar-toggler');
        const collapse = document.querySelector('#winiksoftNavBar');
        if (collapse && collapse.classList.contains('show') && toggle) {
            toggle.click();
        }
    });
});
