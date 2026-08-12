<script>
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import Nav from './components/Nav.svelte';
    import Hero from './components/Hero.svelte';
    import Story from './components/Story.svelte';
    import Profile from './components/Profile.svelte';
    import Gallery from './components/Gallery.svelte';
    import MessageBoard from './components/MessageBoard.svelte';
    import MusicButton from './components/MusicButton.svelte';

    gsap.registerPlugin(ScrollTrigger);

    const PAGES = ['home', 'story', 'profile', 'gallery', 'message'];

    let page = $state('home');
    let wrap = $state(null);
    let switching = $state(false);
    let pending = null;

    function readHash() {
        const h = window.location.hash.replace(/^#\/?/, '');
        return PAGES.includes(h) ? h : 'home';
    }

    function go(next) {
        if (next === page || !PAGES.includes(next)) return;
        window.location.hash = '/' + next;
    }

    function switchTo(next) {
        if (switching) {
            pending = next;
            return;
        }
        switching = true;
        gsap.to(wrap, {
            opacity: 0,
            y: 24,
            duration: 0.22,
            ease: 'power2.in',
            onComplete: () => {
                page = next;
                window.scrollTo(0, 0);
                ScrollTrigger.refresh();
                gsap.fromTo(wrap, { opacity: 0, y: 24 }, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out',
                    onComplete: () => {
                        switching = false;
                        if (pending) {
                            const p = pending;
                            pending = null;
                            switchTo(p);
                        }
                    }
                });
            }
        });
    }

    function onHash() {
        const next = readHash();
        if (next === page) return;
        switchTo(next);
    }

    onMount(() => {
        page = readHash();
        const h = window.location.hash;
        if (!h || !PAGES.includes(h.replace(/^#\/?/, ''))) {
            window.history.replaceState(null, '', '#/home');
        }
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    });
</script>

<Nav {page} {go} />

<div class="pt-[76px] min-h-screen" bind:this={wrap}>
    {#key page}
        {#if page === 'home'}
            <Hero {go} />
        {:else if page === 'story'}
            <Story />
        {:else if page === 'profile'}
            <Profile />
        {:else if page === 'gallery'}
            <Gallery />
        {:else if page === 'message'}
            <MessageBoard />
        {/if}
    {/key}
</div>

<MusicButton />