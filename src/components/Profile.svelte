<script>
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import { PROFILE_INFO, SKILLS } from '../lib/data.js';

    gsap.registerPlugin(ScrollTrigger);

    let root = $state(null);

    onMount(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.sec-fade', { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15,
                scrollTrigger: { trigger: '.sec-fade', start: 'top 80%', once: true }
            });

            gsap.fromTo('.info-card', { opacity: 0, y: 40, scale: 0.92 }, {
                opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.08,
                scrollTrigger: { trigger: '.info-grid', start: 'top 85%', once: true }
            });

            gsap.utils.toArray('.skill-card').forEach((card) => {
                gsap.fromTo(card, { opacity: 0, y: 36 }, {
                    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
                    scrollTrigger: { trigger: card, start: 'top 88%', once: true }
                });
            });
        }, root);

        return () => ctx.revert();
    });
</script>

<div bind:this={root} class="max-w-[1000px] mx-auto px-10 pb-14 max-md:px-5">
    <div class="sec-fade sec-title text-2xl font-bold tracking-wider mb-1.5">
        ✦ 角色 <span class="text-grad">档案</span>
    </div>
    <div class="sec-fade w-14 h-[3px] bg-gradient-to-r from-gold to-gold-light mb-8"></div>

    <h5 class="group-title text-grad font-semibold mb-4"><i class="fas fa-id-card"></i> 基础信息</h5>
    <div class="info-grid grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 mb-9">
        {#each PROFILE_INFO as item}
            <div class="info-card bg-card border border-white/5 rounded-2xl p-5 text-center hover:-translate-y-1.5 hover:border-gold/30 transition-all duration-300">
                <div class="text-[0.7rem] uppercase tracking-widest mb-1.5 font-bold" style="background:linear-gradient(135deg,#f8d98a 0%,#f0c060 40%,#d4a030 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">{item.label}</div>
                <div class="text-[0.95rem] font-light tracking-wide text-white">{item.value}</div>
            </div>
        {/each}
    </div>

    <h5 class="group-title text-grad font-semibold mb-4"><i class="fas fa-bolt"></i> 技能机制</h5>
    {#each SKILLS as skill}
        <div class="skill-card flex gap-4 bg-card border border-white/5 rounded-xl p-[18px] mb-3 hover:-translate-y-1 hover:border-gold/30 transition-all duration-300">
            <div class="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center overflow-hidden">
                <img src={skill.img} alt={skill.name} class="w-10 h-10 object-contain" />
            </div>
            <div class="skill-info min-w-0">
                <h5 class="text-grad font-semibold mb-0.5">{skill.name}</h5>
                <span class="stype text-[0.7rem] text-gold/50 inline-block px-2.5 py-0.5 border border-gold/20 rounded-full mb-1.5">{skill.type}</span>
                <p class="sdesc text-dim text-[0.88rem] leading-relaxed whitespace-pre-line">{skill.desc}</p>
            </div>
        </div>
    {/each}
</div>