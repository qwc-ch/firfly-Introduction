<script>
    import { onMount, onDestroy } from 'svelte';
    import { gsap } from 'gsap';
    import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
    import { MEMORIES } from '../lib/data.js';
    import { GALLERY_AUTO_PLAY_INTERVAL, GALLERY_INACTIVE_SCALE } from '../lib/config.js';

    gsap.registerPlugin(ScrollToPlugin);

    let track = $state(null);
    let container = $state(null);
    let overlayEl = $state(null);
    let selected = $state(null);
    let hovered = $state(false);
    let activeIndex = $state(0);

    let cards = [];
    let cardWidth = 0;
    let gap = 0;
    let autoTimer = null;
    let ctx = null;
    let cleanup = null;

    function measure() {
        if (!track) return;
        const first = track.querySelector('.gallery-card');
        if (!first) return;
        cardWidth = first.offsetWidth;
        gap = 24;
        // 让首尾卡片也能滚动到可视区中央
        const pad = Math.max((track.clientWidth - cardWidth) / 2, 8);
        track.style.paddingLeft = pad + 'px';
        track.style.paddingRight = pad + 'px';
    }

    function getIndex() {
        if (!cardWidth) return 0;
        return Math.max(0, Math.min(Math.round(track.scrollLeft / (cardWidth + gap)), cards.length - 1));
    }

    // 用 quickTo 缓存每张卡的缩放/透明度动画，避免滚动时重复创建 tween
    let scaleQuick = [];
    let opacityQuick = [];

    function initQuickSetters() {
        scaleQuick = cards.map((card) => gsap.quickTo(card, 'scale', { duration: 0.5, ease: 'power3.out' }));
        opacityQuick = cards.map((card) => gsap.quickTo(card, 'opacity', { duration: 0.5, ease: 'power3.out' }));
    }

    function updateActive(force = false) {
        if (!track || !cardWidth) return;
        const idx = getIndex();
        if (!force && idx === activeIndex) return; // 活动卡未变就不重动画
        if (idx !== activeIndex) activeIndex = idx;
        cards.forEach((card, i) => {
            const active = i === idx;
            card.style.zIndex = active ? 2 : 1;
            scaleQuick[i]?.(active ? 1 : GALLERY_INACTIVE_SCALE);
            opacityQuick[i]?.(active ? 1 : 0.55);
        });
    }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(() => {
            if (hovered || !track || cards.length < 2) return;
            const step = cardWidth + gap;
            const target = ((activeIndex + 1) % cards.length) * step;
            if (Math.round(track.scrollLeft) === target) return;
            gsap.to(track, { scrollLeft: target, duration: 0.8, ease: 'power2.inOut' });
        }, GALLERY_AUTO_PLAY_INTERVAL);
    }

    function stopAuto() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    function onManual() {
        startAuto();
    }

    function openMemory(idx) {
        const mem = MEMORIES[idx];
        if (!mem) return;
        selected = { ...mem };
    }

    function closeMemory() {
        selected = null;
    }

    function onKeydown(e) {
        if (e.key === 'Escape') closeMemory();
    }

    onMount(() => {
        const c = container;
        if (!c || !track) return;

        cards = [...track.querySelectorAll('.gallery-card')];
        measure();
        ctx = gsap.context(() => {
            gsap.fromTo('.sec-title, .sec-line', { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15
            });
            gsap.fromTo(cards, { x: 90, opacity: 0 }, {
                x: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.09,
                onComplete: () => updateActive(true)
            });
        }, c);

        initQuickSetters();
        measure();
        startAuto();
        // rAF 节流：滚动事件高频触发，每帧只更新一次
        let scrollRaf = 0;
        const onScroll = () => {
            if (scrollRaf) return;
            scrollRaf = requestAnimationFrame(() => {
                scrollRaf = 0;
                updateActive();
            });
        };
        track.addEventListener('scroll', onScroll, { passive: true });

        const onWheel = (e) => {
            e.preventDefault();
            if (!track) return;
            track.scrollLeft += e.deltaY + e.deltaX;
            onManual();
        };
        track.addEventListener('wheel', onWheel, { passive: false });

        const onDown = () => onManual();
        track.addEventListener('mousedown', onDown);
        track.addEventListener('touchstart', onDown, { passive: true });

        const ro = new ResizeObserver(() => {
            measure();
            updateActive();
        });
        ro.observe(c);

        cleanup = () => {
            if (scrollRaf) cancelAnimationFrame(scrollRaf);
            stopAuto();
            ro.disconnect();
            track.removeEventListener('scroll', onScroll);
            track.removeEventListener('wheel', onWheel);
            track.removeEventListener('mousedown', onDown);
            track.removeEventListener('touchstart', onDown);
        };
    });

    onDestroy(() => {
        cleanup?.();
        ctx?.revert();
    });

    $effect(() => {
        if (selected) {
            document.addEventListener('keydown', onKeydown);
            return () => document.removeEventListener('keydown', onKeydown);
        }
    });

    $effect(() => {
        if (selected && overlayEl) {
            const tl = gsap.timeline();
            tl.fromTo(overlayEl, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
                .fromTo('.memory-card', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }, '-=0.15')
                .fromTo('.memory-card h2', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.2')
                .fromTo('.memory-card p', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.2');
        }
    });
</script>

<div class="min-h-[100svh] flex flex-col" bind:this={container}>
    <div class="max-w-[1000px] mx-auto w-full px-10 max-md:px-5 pt-10 sm:pt-12">
        <div class="sec-title text-2xl font-bold tracking-wider mb-1.5">
            ✦ 记忆 <span class="text-grad">片段</span>
        </div>
        <div class="sec-line w-14 h-[3px] bg-gradient-to-r from-gold to-gold-light mb-8"></div>
    </div>

    <div class="flex-1 flex items-center pb-[236px] sm:pb-[252px]">
        <div class="max-w-[1000px] mx-auto w-full px-10 max-md:px-5">
            <div class="relative" role="region" aria-label="记忆画廊" onmouseenter={() => (hovered = true)} onmouseleave={() => (hovered = false)}>
        <!-- 横向画廊 -->
        <div
            class="gallery-track flex gap-6 overflow-x-auto no-scrollbar pb-2"
            bind:this={track}
        >
            {#each MEMORIES as mem, i}
                <button
                    type="button"
                    class="gallery-card pointer relative shrink-0 w-[min(80vw,520px)] lg:w-[min(55vw,560px)] aspect-video rounded-2xl overflow-hidden bg-card border border-white/5 group"
                    style="box-shadow:0 12px 40px rgba(0,0,0,0.45);"
                    onclick={() => openMemory(i)}
                >
                    <img src="assets/images/memory-{i + 1}.avif" alt={mem.title} class="w-full h-full object-cover pointer-events-none" loading="lazy" />
                    <div class="absolute bottom-0 left-0 right-0 pb-3 pr-4 text-right pointer-events-none">
                        <span class="text-white font-bold text-lg tracking-wider" style="text-shadow:0 2px 14px rgba(0,0,0,0.75);">{mem.title}</span>
                    </div>
                </button>
            {/each}
            </div>
        </div>
    </div>
    </div>
</div>

{#if selected}
    <div
        class="fixed inset-0 z-[9999] flex items-center justify-center p-[30px]"
        style="background:rgba(8,12,20,0.88);backdrop-filter:blur(12px);"
        role="button"
        tabindex="-1"
        bind:this={overlayEl}
        onclick={(e) => e.target === overlayEl && closeMemory()}
        onkeydown={(e) => e.key === 'Escape' && closeMemory()}
    >
        <div class="memory-card relative max-w-[860px] w-full bg-[#0a0e18] rounded-[20px]"><div class="relative aspect-video overflow-hidden rounded-[20px]">
            <img src="assets/images/memory-{selected.id + 1}.avif" alt={selected.title} class="w-full h-full object-cover block" />
            <div
                class="absolute bottom-0 left-0 right-0 h-[65%] pointer-events-none"
                style="background:linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%);"
            ></div>

            <div class="absolute bottom-0 left-0 right-0 px-9 pb-7 max-md:px-5 max-md:pb-5 pointer-events-none">
                <h2 class="text-white text-2xl sm:text-3xl font-bold mb-2 tracking-wider" style="text-shadow:0 2px 20px rgba(0,0,0,0.6);">{selected.title}</h2>
                <div class="w-12 h-[2px] bg-gold mb-2"></div>
                <p class="text-[0.95rem] max-md:text-[0.82rem] leading-[1.7] text-white/80" style="text-shadow:0 1px 12px rgba(0,0,0,0.5);">{selected.desc}</p>
            </div>
            </div>

            <button
                class="pointer absolute top-4 right-5 w-11 h-11 rounded-full text-white text-lg flex items-center justify-center transition-all duration-300 z-10"
                style="background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);"
                onclick={(e) => { e.stopPropagation(); closeMemory(); }}
            >✕</button>
        </div>
    </div>
{/if}