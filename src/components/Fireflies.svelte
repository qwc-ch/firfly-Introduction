<script>
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';

    let container = $state(null);

    onMount(() => {
        const ctx = gsap.context(() => {
            for (let i = 0; i < 20; i++) {
                const el = document.createElement('div');
                el.className = 'firefly';
                el.style.left = gsap.utils.random(2, 98) + '%';
                el.style.top = gsap.utils.random(2, 98) + '%';
                el.style.width = gsap.utils.random(4, 14) + 'px';
                el.style.height = el.style.width;
                container.appendChild(el);

                gsap.set(el, {
                    opacity: gsap.utils.random(0.2, 0.7),
                    scale: gsap.utils.random(0.6, 1.4)
                });

                gsap.to(el, {
                    x: () => `+=${gsap.utils.random(-130, 130)}`,
                    y: () => `+=${gsap.utils.random(-100, 100)}`,
                    scale: gsap.utils.random(0.5, 1.8),
                    opacity: gsap.utils.random(0.2, 1),
                    force3D: true,
                    duration: gsap.utils.random(6, 14),
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true
                });
            }
        }, container);
        return () => ctx.revert();
    });
</script>

<div class="fireflies" bind:this={container}></div>