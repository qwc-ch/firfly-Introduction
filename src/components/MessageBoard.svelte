<script>
    import { onMount, onDestroy } from 'svelte';
    import { init } from '@waline/client';
    import '@waline/client/style';
    import { WALINE_SERVER_URL } from '../lib/config.js';

    let root = $state(null);
    let waline = null;

    onMount(() => {
        if (!root || !WALINE_SERVER_URL) return;
        waline = init({
            el: root,
            serverURL: WALINE_SERVER_URL,
            path: '/',
            lang: 'zh-CN',
            dark: true,
            emoji: false,
            meta: ['nick', 'mail', 'link'],
            requiredMeta: ['nick'],
            login: 'enable',
            pageview: false,
            reaction: false,
            locale: {
                placeholder: '写下你想对流萤说的话…'
            }
        });
    });

    onDestroy(() => {
        waline?.destroy();
        waline = null;
    });
</script>

<div class="max-w-[1000px] mx-auto px-10 pb-14 max-md:px-5">
    <div class="sec-title text-2xl font-bold tracking-wider mb-1.5">
        ✦ 传达 <span class="text-grad">心意</span>
    </div>
    <div class="w-14 h-[3px] bg-gradient-to-r from-gold to-gold-light mb-8"></div>

    {#if WALINE_SERVER_URL}
        <div bind:this={root}></div>
    {:else}
        <div class="text-center py-16 text-dim border border-dashed border-white/10 rounded-2xl">
            <i class="text-grad text-4xl block mb-3 fas fa-comment-dots"></i>
            <p class="mb-2">留言板使用 Waline 评论系统</p>
            <p class="text-sm opacity-70">请在 <code class="text-gold/70">src/lib/config.ts</code> 中填写 <code class="text-gold/70">WALINE_SERVER_URL</code> 后启用</p>
        </div>
    {/if}
</div>