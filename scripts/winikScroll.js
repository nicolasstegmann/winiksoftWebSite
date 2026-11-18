// winikScroll.js — smooth scroll + pinned scroll scenes built from the W bars
(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NAV_OFFSET = -72;

    // ── Smooth scroll ─────────────────────────────────────────────────────────
    let lenis = null;
    if (!reduceMotion && typeof Lenis !== 'undefined') {
        lenis = new Lenis({ lerp: 0.09 });
        window.winikLenis = lenis;
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(time => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link || link.hasAttribute('data-toggle')) return;
            const hash = link.getAttribute('href');
            const target = hash.length > 1 && document.querySelector(hash);
            if (!target) return;
            e.preventDefault();
            // pins and late-loading content change the page height: re-measure before scrolling
            lenis.resize();
            const y = target.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
            lenis.scrollTo(y, { duration: 1.4 });
            history.replaceState(null, '', hash);
        });
    }

    const mm = gsap.matchMedia();

    // ── Hero: the W's glass bars open into a fluted-glass curtain ────────────
    const hero = document.getElementById('inicio');
    const barsHost = hero && hero.querySelector('.heroBars');
    if (hero && barsHost) {
        mm.add('(min-width: 1000px)', () => buildHeroBars(hero, barsHost));
    }

    function buildHeroBars(hero, host) {
        const COLS = 12;
        const W_COLS = [2, 5, 8, 11];
        const bars = [];

        for (let col = 0; col < COLS; col++) {
            const isW = W_COLS.includes(col);
            const el = document.createElement('div');
            el.className = 'heroBar' + (isW ? ' heroBar--w' : '');
            el.style.setProperty('--streak-delay', ((col * 0.83) % 5).toFixed(2) + 's');
            el.innerHTML = '<div class="heroBarInner"></div>';
            host.appendChild(el);
            bars.push({ el, col, isW, k: W_COLS.indexOf(col) });
        }

        const wBars = bars.filter(b => b.isW);
        const glassBars = bars.filter(b => !b.isW);
        const size = () => ({ w: hero.clientWidth, h: hero.clientHeight });

        // right edge of the hero copy, so the W always sits in the free space beside it
        const contentRight = () => {
            const heroLeft = hero.getBoundingClientRect().left;
            const els = hero.querySelectorAll('.heroTitleAccent, .heroLine--1 .heroWord, .heroSubtitle, .heroStatements');
            return Math.max(0, ...[...els].map(el => el.getBoundingClientRect().right - heroLeft));
        };

        // W geometry (same proportions as the AI-section morph): 4 strokes \ / \ /
        // total horizontal span of the W ≈ 1.344 × bar length
        const wState = (b) => {
            const { w, h } = size();
            const free = w - 32 - (contentRight() + 48);
            const len = Math.max(160, Math.min(h * 0.56, w * 0.3, free / 1.344));
            const cx = Math.min(w - 32 - len * 0.672, contentRight() + 48 + Math.max(free, len * 1.344) / 2);
            return {
                x: cx + (b.k - 1.5) * len * 0.252,
                y: h * 0.52,
                width: len * 0.2615,
                height: len,
                rotation: b.k % 2 ? 20 : -20,
            };
        };
        const colState = (b) => {
            const { w, h } = size();
            const cw = w / COLS;
            return { x: (b.col + 0.5) * cw, y: h / 2, width: cw * 0.84, height: h * 1.5, rotation: 0 };
        };
        // function-based values so ScrollTrigger recomputes them on resize
        const live = (stateFn, b, extra) => {
            const o = {};
            ['x', 'y', 'width', 'height', 'rotation'].forEach(k => { o[k] = () => stateFn(b)[k]; });
            return Object.assign(o, extra);
        };

        gsap.set(bars.map(b => b.el), { xPercent: -50, yPercent: -50 });

        if (reduceMotion) {
            wBars.forEach(b => gsap.set(b.el, wState(b)));
            glassBars.forEach(b => gsap.set(b.el, { autoAlpha: 0 }));
            return () => { host.innerHTML = ''; };
        }

        // entrance + idle float live on the inner layer, so they never fight the scroll timeline
        const wInners = wBars.map(b => b.el.firstChild);
        gsap.from(wInners, { yPercent: 35, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 1.6 });
        wInners.forEach((inner, i) => {
            gsap.to(inner, { y: i % 2 ? 10 : -10, duration: 2.8 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.8 });
        });

        const content = hero.querySelector('.heroFullContent');
        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: '+=150%',
                pin: true,
                scrub: 0.8,
                invalidateOnRefresh: true,
                anticipatePin: 1,
            },
        });

        // 1 · the W straightens and spreads into columns; the rest of the curtain multiplies around it
        wBars.forEach(b => {
            tl.fromTo(b.el, live(wState, b), live(colState, b, { duration: 0.45, ease: 'power2.inOut' }), 0);
        });
        glassBars.forEach(b => {
            const nearest = Math.min(...W_COLS.map(c => Math.abs(c - b.col)));
            tl.fromTo(b.el,
                live(colState, b, { scaleY: 0, opacity: 0 }),
                live(colState, b, { scaleY: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }),
                0.18 + nearest * 0.07);
        });
        tl.fromTo(content, { opacity: 1, x: 0 }, { opacity: 0.35, x: -50, duration: 0.45 }, 0.05);
        const indicator = hero.querySelector('.scrollIndicator');
        if (indicator) tl.fromTo(indicator, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0);

        // 2 · hold, then the columns thin into light lines and shoot out, alternating up/down,
        //     uncovering the second scene: the statement behind the glass
        bars.forEach(b => {
            const dir = b.col % 2 ? 1 : -1;
            tl.to(b.el, {
                width: 3,
                y: () => size().h / 2 + dir * size().h * 1.4,
                duration: 0.35,
                ease: 'power2.in',
            }, 0.66 + Math.abs(b.col - (COLS - 1) / 2) * 0.012);
        });
        tl.to(content, { opacity: 0, duration: 0.15 }, 0.62);

        const reveal = hero.querySelector('.heroReveal');
        if (reveal) {
            tl.fromTo(reveal,
                { autoAlpha: 0, scale: 0.94, letterSpacing: '0.04em' },
                { autoAlpha: 1, scale: 1, letterSpacing: '-0.02em', duration: 0.32, ease: 'power2.out' }, 0.74);
        }

        return () => { host.innerHTML = ''; };
    }

    // ── Services: pinned horizontal track ────────────────────────────────────
    const services = document.getElementById('servicios');
    if (services && !reduceMotion) {
        mm.add('(min-width: 1000px) and (min-height: 700px)', () => {
            const list = services.querySelector(':scope > .standList');
            if (!list) return;

            services.classList.add('is-hscroll');

            // the heading, intro and CTA become the first panel of the track
            const moved = [...services.querySelectorAll(':scope > h2, :scope > h3, :scope > .callToAction')];
            const intro = document.createElement('li');
            intro.className = 'hscrollIntro';
            moved.forEach(el => intro.appendChild(el));
            list.prepend(intro);

            const progress = document.createElement('div');
            progress.className = 'hscrollProgress';
            progress.innerHTML = '<span></span>';
            list.after(progress);

            const distance = () => Math.max(0, list.scrollWidth - window.innerWidth);
            gsap.timeline({
                scrollTrigger: {
                    trigger: services,
                    start: 'top top',
                    end: () => '+=' + distance(),
                    pin: true,
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                },
            })
                .to(list, { x: () => -distance(), ease: 'none' }, 0)
                .to(progress.firstChild, { scaleX: 1, ease: 'none' }, 0);

            return () => {
                services.classList.remove('is-hscroll');
                progress.remove();
                const [h2, h3, cta] = moved;
                list.before(h2, h3);
                list.after(cta);
                intro.remove();
                gsap.set(list, { clearProps: 'transform' });
            };
        });
    }

    // ── AI: beams of light converging on the AI logo (canvas) ────────────────
    const ia = document.getElementById('ia');
    const aiLogo = document.getElementById('aiLogo');
    if (ia && aiLogo) buildBeams(ia, aiLogo);

    function buildBeams(section, logo) {
        const canvas = document.createElement('canvas');
        canvas.className = 'aiBeams';
        canvas.setAttribute('aria-hidden', 'true');
        section.prepend(canvas);
        const ctx = canvas.getContext('2d');

        const count = window.matchMedia('(max-width: 899px)').matches ? 70 : 150;
        const lines = Array.from({ length: count }, (_, i) => ({
            t: i / (count - 1),
            seed: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.8,
            hue: 188 + Math.random() * 82,
            alpha: 0.06 + Math.random() * 0.22,
            width: Math.random() < 0.1 ? 1.8 : 0.9,
        }));
        const state = { spread: 1 };
        let w = 0, h = 0, fx = 0, fy = 0;

        function measure() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = section.clientWidth;
            h = section.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const r = logo.getBoundingClientRect();
            const s = section.getBoundingClientRect();
            fx = r.left - s.left + r.width * 0.42;
            fy = r.top - s.top + r.height * 0.5;
        }

        function draw(time) {
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';
            const s = state.spread;
            for (const l of lines) {
                const y0 = (l.t * 1.8 - 0.4) * h;
                const dy = y0 - fy;
                const wave = Math.sin(time * 0.0005 * l.speed + l.seed) * 22;
                ctx.beginPath();
                ctx.moveTo(-30, fy + dy * (0.45 + 0.55 * s));
                ctx.bezierCurveTo(
                    fx * 0.35, fy + dy * s * 0.85 + wave,
                    fx * 0.72, fy + dy * s * 0.22 + wave * 0.4,
                    fx, fy
                );
                ctx.strokeStyle = `hsla(${l.hue}, 95%, 66%, ${l.alpha})`;
                ctx.lineWidth = l.width;
                ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over';
        }

        measure();
        window.addEventListener('resize', () => { measure(); if (reduceMotion) draw(0); });
        ScrollTrigger.addEventListener('refresh', measure);

        if (reduceMotion) {
            state.spread = 0.35;
            draw(0);
            return;
        }

        gsap.to(state, {
            spread: 0.16,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'center 55%', scrub: true },
        });

        let running = false;
        const loop = (t) => { if (!running) return; draw(t); requestAnimationFrame(loop); };
        new IntersectionObserver(([entry]) => {
            running = entry.isIntersecting;
            if (running) requestAnimationFrame(loop);
        }).observe(section);
    }

    // pins add spacing: order every trigger by page position and recompute
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
})();
