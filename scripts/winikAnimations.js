// winikAnimations.js — GSAP scroll animations for redesign-v2

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

// ── Hero text reveal ──────────────────────────────────────────────────────────
document.querySelectorAll('.heroWinikText').forEach(el => {
    gsap.from(el, {
        opacity: 0, y: 32,
        duration: 0.9, ease: 'power3.out', delay: 0.3,
    });
});

// ── Section header reveals ────────────────────────────────────────────────────
document.querySelectorAll('.sectionHeader h2, .sectionHeader h3').forEach(el => {
    gsap.from(el, {
        opacity: 0, y: 24,
        duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
    });
});

// ── Card stagger: standList and teamGrid ──────────────────────────────────────
document.querySelectorAll('.standList, .teamGrid').forEach(list => {
    const items = gsap.utils.toArray(list.children);
    if (!items.length) return;
    gsap.from(items, {
        opacity: 0, y: 40,
        duration: 0.6, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: list, start: 'top 85%', toggleActions: 'play none none none' },
    });
});

// ── Aside section reveals ─────────────────────────────────────────────────────
document.querySelectorAll('.asideRight .asideImage, .asideLeft .asideStory').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: -60,
        duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
});

document.querySelectorAll('.asideLeft .asideImage, .asideRight .asideStory').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: 60,
        duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
});

// ── Generic GSAP reveal classes (fallback) ────────────────────────────────────
document.querySelectorAll('.gsap-reveal').forEach(el => {
    gsap.from(el, {
        opacity: 0, y: 32,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
});

document.querySelectorAll('.gsap-reveal-left').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: -48,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
});

document.querySelectorAll('.gsap-reveal-right').forEach(el => {
    gsap.from(el, {
        opacity: 0, x: 48,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
});
