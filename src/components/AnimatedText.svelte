<script>
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';

    let {
        text,
        class: cls = '',
        charClass = '',
        stagger = 0.04,
        duration = 0.9,
        delay = 0,
        randomize = false
    } = $props();

    let el = $state(null);

    onMount(() => {
        if (!el) return;

        const chars = [...text].map((c) => {
            const span = document.createElement('span');
            span.textContent = c === ' ' ? '\u00A0' : c;
            span.className = charClass;
            span.style.display = 'inline-block';
            span.style.willChange = 'transform';
            el.appendChild(span);
            return span;
        });

        const ctx = gsap.context(() => {
            gsap.from(chars, {
                y: () => (randomize ? gsap.utils.random(-70, 40) : 60),
                rotation: () => (randomize ? gsap.utils.random(-40, 40) : 0),
                opacity: 0,
                duration,
                delay,
                ease: 'back.out(1.5)',
                stagger: { each: stagger, from: randomize ? 'random' : 'start' }
            });
        }, el);

        return () => ctx.revert();
    });
</script>

<div class="whitespace-nowrap {cls}" bind:this={el} aria-label={text}></div>