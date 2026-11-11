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
const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');

function setActiveNav(id) {
    navLinks.forEach(link => {
        link.classList.toggle('spy-active', link.getAttribute('href') === '#' + id);
    });
}

// Build ordered list of [id, element] pairs matching nav hrefs
const spySections = [...navLinks]
    .map(l => l.getAttribute('href').replace('#', ''))
    .map(id => document.getElementById(id))
    .filter(Boolean);

function updateScrollSpy() {
    // Find the last section whose top is above the viewport midpoint
    const midY = window.scrollY + window.innerHeight * 0.45;
    let current = spySections[0];
    for (const el of spySections) {
        if (el.getBoundingClientRect().top + window.scrollY <= midY) {
            current = el;
        }
    }
    if (current) setActiveNav(current.id);
}

window.addEventListener('scroll', updateScrollSpy, { passive: true });
updateScrollSpy();

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

// ── AI logo: W ⇄ AI morph ─────────────────────────────────────────────────────
(function () {
    const logo = document.getElementById('aiLogo');
    if (!logo) return;

    // svgOrigin = each bar's natural center; x/y move that center to the target shape
    const bars = [
        { el: '#aiBar1', origin: '118 180', W: { x: 34,   y: 6, rotation: -20 }, AI: { x: 35, y: -10, rotation: 26 } },
        { el: '#aiBar2', origin: '232 180', W: { x: -15,  y: 6, rotation: 20 },  AI: { x: 5,  y: -10, rotation: -26 } },
        { el: '#aiBar3', origin: '384 180', W: { x: -101, y: 6, rotation: -20 }, AI: { x: 5,  y: -10, rotation: 0 } },
        { el: '#aiBar4', origin: '384 180', W: { x: -35,  y: 6, rotation: 20 },  AI: { x: 5,  y: -10, rotation: 0 } },
    ];

    bars.forEach(b => gsap.set(b.el, { svgOrigin: b.origin, ...b.W }));

    const tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true, repeatDelay: 2.4, delay: 0.6 });
    bars.forEach((b, i) => {
        tl.to(b.el, { ...b.AI, duration: 1.3, ease: 'expo.inOut' }, i * 0.08);
    });

    const obs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        logo.classList.add('ai-animated');
        tl.play();
        obs.disconnect();
    }, { threshold: 0.25 });
    obs.observe(logo);
})();

// ── KrakTeam: kraken reveal + idle life ──────────────────────────────────────
(function () {
    const hero = document.getElementById('krakHero');
    if (!hero) return;

    hero.querySelectorAll('.krakWord').forEach(word => {
        word.innerHTML = [...word.textContent].map(c => `<span class="krakChar">${c}</span>`).join('');
    });

    const q = sel => hero.querySelectorAll(sel);
    const tents = q('.krakTent');
    const eyes = q('.krakEye');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.set(q('.krakHead'), { y: -50, opacity: 0 });
    gsap.set(tents, { strokeDashoffset: 1 });
    gsap.set(eyes, { scaleY: 0, transformOrigin: '50% 50%' });
    gsap.set(q('.krakChar'), { yPercent: 80, opacity: 0 });
    gsap.set(q('.krakEyebrow, .krakBy, .krakTagline'), { opacity: 0, y: 16 });
    gsap.set(q('.krakManifesto li'), { opacity: 0, y: 24, filter: 'blur(8px)' });
    gsap.set(q('.krakSwoosh path'), { strokeDashoffset: 1 });
    gsap.set(q('.krakGlow'), { opacity: 0 });

    function startIdle() {
        gsap.to(q('.krakHead'), { y: -6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        tents.forEach((t, i) => {
            gsap.to(t, {
                rotation: i % 2 ? 5 : -5,
                svgOrigin: t.dataset.origin,
                duration: 2.2 + i * 0.25,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
        });
        gsap.timeline({ repeat: -1, repeatDelay: 3.6 })
            .to(eyes, { scaleY: 0.1, duration: 0.08, ease: 'power2.in', yoyo: true, repeat: 1 });
    }

    const tl = gsap.timeline({ paused: true, onComplete: startIdle });
    tl.to(q('.krakGlow'), { opacity: 1, duration: 1 }, 0)
      .to(q('.krakHead'), { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.6)' }, 0)
      .to(tents, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out', stagger: { each: 0.08, from: 'end' } }, 0.45)
      .to(eyes, { scaleY: 1, duration: 0.3, ease: 'power4.out' }, 1.1)
      .to(q('.krakEyebrow'), { opacity: 1, y: 0, duration: 0.5 }, 0.3)
      .to(q('.krakChar'), { yPercent: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.04 }, 0.4)
      .to(q('.krakBy'), { opacity: 1, y: 0, duration: 0.5 }, 0.9)
      .to(q('.krakManifesto li'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.3 }, 1.1)
      .to(q('.krakTagline'), { opacity: 1, y: 0, duration: 0.5 }, 2.1)
      .to(q('.krakSwoosh path'), { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 2.4);

    const logo = hero.querySelector('.krakLogo');
    logo.addEventListener('mouseenter', () => gsap.to(q('.krakTentacles'), { scale: 1.06, svgOrigin: '150 180', duration: 0.4, ease: 'back.out(2)' }));
    logo.addEventListener('mouseleave', () => gsap.to(q('.krakTentacles'), { scale: 1, svgOrigin: '150 180', duration: 0.5, ease: 'power2.out' }));

    const obs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        tl.play();
        obs.disconnect();
    }, { threshold: 0.3 });
    obs.observe(hero);
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
