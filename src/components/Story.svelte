<script>
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import { STORY_ITEMS } from '../lib/data.js';

    gsap.registerPlugin(ScrollTrigger);

    let root = $state(null);

    onMount(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.sec-fade', { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15,
                scrollTrigger: { trigger: '.sec-fade', start: 'top 80%', once: true }
            });

            gsap.utils.toArray('.story-card').forEach((card, i) => {
                gsap.fromTo(card, { opacity: 0, x: i % 2 === 0 ? -50 : 50, scale: 0.96 }, {
                    opacity: 1, x: 0, scale: 1, duration: 0.85, ease: 'power3.out',
                    scrollTrigger: { trigger: card, start: 'top 85%', once: true }
                });
            });

            gsap.fromTo('.story-quote', { opacity: 0, y: 24, scale: 0.95 }, {
                opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.4)',
                scrollTrigger: { trigger: '.story-quote', start: 'top 85%', once: true }
            });
        }, root);

        return () => ctx.revert();
    });
</script>

<div bind:this={root} class="max-w-[1000px] mx-auto px-10 pb-14 max-md:px-5">
    <div class="sec-fade sec-title text-2xl font-bold tracking-wider mb-1.5">
        ✦ 成长 <span class="text-grad">轨迹</span>
    </div>
    <div class="sec-fade w-14 h-[3px] bg-gradient-to-r from-gold to-gold-light mb-8"></div>

    {#each STORY_ITEMS as item, i}
        <article class="story-card flex gap-5 bg-card border border-white/5 rounded-2xl overflow-hidden mb-[18px] border-l-[3px] border-l-transparent hover:border-l-gold hover:translate-x-1 transition-all duration-300 max-md:flex-col">
            <div class="shrink-0 w-40 h-40 p-0 m-0 border-r border-white/5 max-md:w-full max-md:h-24 max-md:border-r-0" data-imgslot>
                <img src={item.img} alt={item.title} class="w-full h-full object-cover rounded-none" />
            </div>
            <div class="flex-1 py-[22px] pr-[22px] max-md:p-5">
                <h4 class="text-grad font-semibold text-lg mb-1">{item.title}</h4>
                <div class="text-xs text-gold/45 tracking-wider mb-2.5">{item.kw}</div>
                <p class="text-dim text-[0.93rem] leading-[1.8]">{item.desc}</p>
            </div>
        </article>
    {/each}

    <div class="story-quote mt-7 px-6 py-[18px] border-l-[3px] border-gold italic text-lg text-center">
        「会找到的，属于我的梦…」
    </div>
</div>