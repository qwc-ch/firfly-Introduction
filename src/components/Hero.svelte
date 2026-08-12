<script>
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import Fireflies from './Fireflies.svelte';
    import AnimatedText from './AnimatedText.svelte';
    import { HERO_TAGS } from '../lib/data.js';

    let { go } = $props();

    let root = $state(null);
    let mottoBox = $state(null);
    let typingText = $state(null);
    let cursorEl = $state(null);
    let btnEl = $state(null);
    let ctx;
    let typeTimer = null;

    // 顶部夜空星星（伪随机分布，仅生成一次）
    let stars = $state(
        Array.from({ length: 16 }, (_, i) => ({
            left: (i * 53 + 11) % 96 + 2,
            top: (i * 29 + 7) % 20 + 1,
            delay: (i * 0.37) % 3,
            dur: 2.4 + ((i * 17) % 30) / 10
        }))
    );

    onMount(() => {
        ctx = gsap.context(() => {
            gsap.set(btnEl, { opacity: 0, y: 18 });
            gsap.set(mottoBox, { opacity: 0, y: 10 });

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.fromTo('.hero-tag', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.6 }, 0.9)
                .to(mottoBox, { opacity: 1, y: 0, duration: 0.4 }, 1.05);

            // 打字光标闪烁
            gsap.to(cursorEl, { opacity: 0, duration: 0.55, repeat: -1, yoyo: true, ease: 'steps(1)', delay: 1.05 });

            // 打字机
            const full = '「飞萤扑火，向死而生」';
            setTimeout(() => {
                if (!typingText) return;
                let i = 0;
                typingText.textContent = '';
                typeTimer = setInterval(() => {
                    i++;
                    typingText.textContent = full.slice(0, i);
                    if (i >= full.length) {
                        clearInterval(typeTimer);
                        typeTimer = null;
                        // 打字完成 → 按钮出现
                        gsap.to(btnEl, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
                    }
                }, 170);
            }, 1150);
        }, root);

        return () => {
            if (typeTimer) clearInterval(typeTimer);
            ctx.revert();
        };
    });
</script>

<section class="hero-title relative h-[calc(100vh-76px)] min-h-[400px] overflow-hidden flex items-center justify-center text-center" bind:this={root}>
    <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover" src="assets/video/firefly-bg.mp4"></video>
    <div class="absolute inset-0 bg-bg/50"></div>

    <!-- 顶部夜空：压暗黑块并补上星空，与画面下方统一 -->
    <div class="hero-sky absolute top-0 left-0 right-0 h-[42%] pointer-events-none">
        {#each stars as s}
            <span
                class="star"
                style="left:{s.left}%;top:{s.top}%;animation-delay:{s.delay}s;animation-duration:{s.dur}s;"
            ></span>
        {/each}
    </div>

    <Fireflies />

    <div class="relative z-[3] px-5">
        <h1 class="m-0">
            <AnimatedText
                text="流 萤"
                class="text-grad-light text-[4rem] lg:text-6xl font-black tracking-[10px]"
                charClass="text-grad-light"
                stagger={0.14}
                duration={1}
            />
        </h1>

        <div class="mt-3">
            <AnimatedText
                text="FIREFLY"
                class="text-gold text-sm font-bold tracking-[0.6em]"
                charClass="text-gold"
                stagger={0.05}
                duration={0.7}
                delay={0.8}
            />
        </div>

        <div class="flex flex-wrap justify-center gap-3 mt-6">
            {#each HERO_TAGS as t}
                <span class="hero-tag border border-gold/30 text-gold px-5 py-1.5 rounded-full text-sm tracking-wider">{t}</span>
            {/each}
        </div>

        <div class="motto italic text-lg lg:text-xl border-l-[3px] border-gold pl-5 mt-5 text-left inline-block min-w-[240px]" bind:this={mottoBox}>
            <span bind:this={typingText} class="text-text"></span><span class="text-gold font-light" bind:this={cursorEl}>|</span>
        </div>

        <a class="btn-explore pointer inline-block mt-10 border-[1.5px] border-gold text-gold px-9 py-3 rounded-full font-semibold hover:bg-gradient-to-r hover:from-gold-light hover:to-gold hover:text-bg hover:shadow-[0_0_35px_rgba(0,212,170,0.25)] transition-all duration-300" onclick={() => go('story')} bind:this={btnEl}>
            <i class="fas fa-chevron-down"></i> 探索她的故事
        </a>
    </div>
</section>