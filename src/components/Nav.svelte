<script>
    import { fade } from 'svelte/transition';
    import { PAGES } from '../lib/data.js';

    let { page, go } = $props();
    let open = $state(false);

    function select(id) {
        open = false;
        go(id);
    }
</script>

<nav class="fixed top-0 left-0 right-0 z-[999] py-2 bg-transparent border-b border-transparent">
    <div class="max-w-6xl mx-auto px-5 flex items-center justify-between">
        <button type="button" class="pointer flex items-center gap-1.5" onclick={() => go && go('home')} aria-label="Firefly">
            <img src="assets/logo/firefly.avif" alt="" class="h-5 w-5 object-contain" />
            <span class="text-grad font-semibold text-sm tracking-[0.25em] pt-0.5">Firefly</span>
        </button>

        <button type="button" class="pointer lg:hidden text-gold text-lg leading-none" onclick={() => (open = !open)} aria-label="菜单">
            <i class="fas fa-bars"></i>
        </button>

        <ul class="hidden lg:flex items-center gap-1 ml-auto">
            {#each PAGES as p}
                <li>
                    <button
                        type="button"
                        class="nav-line pointer block text-[13px] font-medium mx-1 py-1 {page === p.id ? 'text-gold' : 'text-dim'}"
                        onclick={() => select(p.id)}
                    >{p.label}</button>
                </li>
            {/each}
        </ul>
    </div>

    {#if open}
        <div class="lg:hidden mt-2 mx-3 rounded-xl bg-bg/90 backdrop-blur-md border border-gold/10 px-5 py-2" transition:fade={{ duration: 150 }}>
            {#each PAGES as p}
                <button
                    type="button"
                    class="block w-full text-left py-2.5 text-sm {page === p.id ? 'text-gold' : 'text-dim'} pointer"
                    onclick={() => select(p.id)}
                >{p.label}</button>
            {/each}
        </div>
    {/if}
</nav>