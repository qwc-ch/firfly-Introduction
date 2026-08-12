<script>
    import { onMount, onDestroy } from 'svelte';
    import { gsap } from 'gsap';
    import AnimatedText from './AnimatedText.svelte';
    import { METING_SERVERS, METING_SERVER, METING_PLAYLIST_ID, LOCAL_MUSIC_URL, LOCAL_COVER_URL } from '../lib/config.js';

    // ── 状态 ──
    let songs = $state([]);
    let index = $state(0);
    let playing = $state(false);
    let playMode = $state('list'); // list | one | random
    let currentTime = $state(0);
    let duration = $state(0);
    let volume = $state(0.6);
    let muted = $state(false);
    let loading = $state(true);
    let failed = $state(false);

    let open = $state(false);
    let drawerOpen = $state(false);

    // ── DOM ──
    let cardEl = $state(null);
    let btnDisc = $state(null);
    let cardDisc = $state(null);
    let audioEl = $state(null);
    let progressEl = $state(null);
    let volEl = $state(null);

    let spinTween = null;
    let unlisten = () => {};

    const MODES = ['list', 'one', 'random'];

    // ── 获取歌单 ──
    async function fetchSongs() {
        for (const base of METING_SERVERS) {
            try {
                const res = await fetch(`${base}?server=${METING_SERVER}&type=playlist&id=${METING_PLAYLIST_ID}`);
                if (!res.ok) continue;
                const data = await res.json();
                const list = (Array.isArray(data) ? data : [])
                    .map((s) => ({
                        name: s.name || s.title || '未知曲目',
                        artist: s.artist || s.author || '',
                        url: s.url || '',
                        pic: s.pic || s.cover || ''
                    }))
                    .filter((s) => s.url);
                if (list.length) return list;
            } catch (e) {
                console.warn('Meting 请求失败:', base, e);
            }
        }
        return null;
    }

    function useLocal() {
        failed = true;
        songs = [{ name: '本地背景音乐', artist: '流萤', url: LOCAL_MUSIC_URL, pic: LOCAL_COVER_URL }];
    }

    function playSong(i, autoplay = true) {
        const s = songs[i];
        if (!s) return;
        index = i;
        currentTime = 0;
        if (audioEl) {
            audioEl.src = s.url;
            if (autoplay) {
                audioEl.play().then(() => (playing = true)).catch(() => {});
            }
        }
    }

    function next(auto = false) {
        if (!songs.length) return;
        let i;
        if (playMode === 'random') {
            i = Math.floor(Math.random() * songs.length);
        } else {
            i = (index + 1) % songs.length;
        }
        playSong(i, auto || playing);
    }

    function prev() {
        if (!songs.length) return;
        let i;
        if (playMode === 'random') {
            i = Math.floor(Math.random() * songs.length);
        } else {
            i = (index - 1 + songs.length) % songs.length;
        }
        playSong(i);
    }

    function onEnded() {
        if (playMode === 'one' && audioEl) {
            audioEl.currentTime = 0;
            audioEl.play().catch(() => {});
        } else {
            next(true);
        }
    }

    function onAudioError() {
        if (songs.length > 1 && !failed) next(true);
    }

    function toggle() {
        if (!audioEl || !songs.length) return;
        if (playing) {
            audioEl.pause();
            playing = false;
        } else {
            audioEl.play().then(() => (playing = true)).catch(() => {});
        }
    }

    function cycleMode() {
        playMode = MODES[(MODES.indexOf(playMode) + 1) % MODES.length];
        if (playMode === 'one' && audioEl) audioEl.loop = true;
        else if (audioEl) audioEl.loop = false;
    }

    function onInteract() {
        if (!audioEl || !songs.length || failed) return;
        if (audioEl.paused && !audioEl.src) {
            audioEl.src = songs[index].url;
        }
        audioEl.play().then(() => (playing = true)).catch(() => {});
        unlisten();
    }

    function seek(e) {
        if (!audioEl || !progressEl || !duration) return;
        const ratio = e.offsetX / progressEl.offsetWidth;
        audioEl.currentTime = ratio * duration;
    }

    function setVol(e) {
        if (!audioEl || !volEl) return;
        const v = e.offsetX / volEl.offsetWidth;
        audioEl.volume = v;
        volume = v;
        muted = v === 0;
    }

    function toggleMute() {
        if (!audioEl) return;
        muted = !muted;
        audioEl.volume = muted ? 0 : volume;
    }

    function fmt(t) {
        if (!isFinite(t)) return '0:00';
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    // ── 收起（带退场动画） ──
    function closeCard() {
        if (!cardEl) {
            open = false;
            return;
        }
        gsap.killTweensOf(cardEl);
        gsap.to(cardEl, {
            opacity: 0,
            y: 24,
            scale: 0.9,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => (open = false)
        });
    }

    function toggleCard() {
        if (open) closeCard();
        else open = true;
    }

    // ── 封面旋转 ──
    function startSpin() {
        const discs = [btnDisc, cardDisc];
        if (!discs.some(Boolean)) return;
        if (spinTween) {
            spinTween.play();
            return;
        }
        spinTween = gsap.to(discs, { rotation: 360, duration: 8, repeat: -1, ease: 'none' });
    }

    function stopSpin() {
        spinTween?.pause();
    }

    // ── 生命周期 ──
    onMount(async () => {
        if (audioEl) audioEl.volume = volume;
        const data = await fetchSongs();
        loading = false;
        if (data) songs = data;
        else useLocal();

        document.addEventListener('click', onInteract);
        document.addEventListener('touchstart', onInteract);
        unlisten = () => {
            document.removeEventListener('click', onInteract);
            document.removeEventListener('touchstart', onInteract);
        };
    });

    onDestroy(() => {
        unlisten();
        stopSpin();
    });

    $effect(() => {
        if (playing) startSpin();
        else stopSpin();
    });

    $effect(() => {
        if (open && cardEl) {
            const tl = gsap.timeline();
            tl.fromTo(cardEl, { opacity: 0, y: 36, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' })
                .fromTo('.mc-disc', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'elastic.out(1, 0.6)' }, '-=0.25')
                .fromTo('.mc-songname', { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }, '-=0.4')
                .fromTo('.mc-progress', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.55, ease: 'power3.out' }, '-=0.25')
                .fromTo('.mc-controls button', { scale: 0, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2.2)', stagger: 0.06 }, '-=0.35')
                .fromTo('.mc-volume', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }, '-=0.25');
        }
    });

    $effect(() => {
        if (drawerOpen) {
            gsap.fromTo('.mc-song-item', { x: 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.04 });
        }
    });
</script>

<audio
    bind:this={audioEl}
    preload="auto"
    ontimeupdate={() => (currentTime = audioEl?.currentTime || 0)}
    ondurationchange={() => (duration = audioEl?.duration || 0)}
    onended={onEnded}
    onerror={onAudioError}
></audio>

<!-- 封面按钮 -->
<button
    class="pointer fixed bottom-6 left-6 z-[1000] w-14 h-14 rounded-full overflow-hidden transition-all duration-300"
    style="background:rgba(8,12,20,0.9);border:2px solid {playing || open ? '#00d4aa' : 'rgba(0,212,170,0.25)'};opacity:{loading ? 0.7 : 1};box-shadow:0 0 20px rgba(0,212,170,{playing ? 0.25 : 0.1});"
    title={songs[index] ? `${songs[index].name} - ${songs[index].artist}` : '背景音乐'}
    data-testid="music-btn"
    onclick={toggleCard}
>
    {#if songs.length}
        <div class="w-full h-full rounded-full overflow-hidden" bind:this={btnDisc}>
            <img src={songs[index]?.pic || LOCAL_COVER_URL} alt="音乐封面" class="w-full h-full object-cover rounded-full" />
        </div>
    {:else}
        <div class="w-full h-full flex items-center justify-center text-gold text-xl">{loading ? '…' : '🎵'}</div>
    {/if}
</button>

<!-- 播放器卡片 -->
{#if open}
    <div class="fixed inset-0 z-[990]" onclick={closeCard}></div>

    <div
        class="fixed bottom-24 left-6 z-[991] w-[340px] max-w-[calc(100vw-48px)] bg-[#0d1320]/95 backdrop-blur-xl border border-gold/20 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        bind:this={cardEl}
        onclick={(e) => e.stopPropagation()}
    >
        <!-- 名字动画 -->
        <div class="flex items-center justify-between mb-2">
            <AnimatedText
                text="流萤 Firefly"
                class="text-sm font-bold tracking-[0.2em]"
                charClass="text-grad"
                stagger={0.045}
                delay={0.35}
            />
            <button class="pointer text-dim hover:text-gold transition-colors p-1" onclick={closeCard} title="收起" aria-label="收起">
                <i class="fas fa-chevron-down"></i>
            </button>
        </div>

        <!-- 顶部:封面 + 信息 -->
        <div class="flex items-center gap-3 mb-3">
            <div class="mc-disc shrink-0 w-12 h-12 rounded-full overflow-hidden border border-white/10">
                <div class="w-full h-full rounded-full overflow-hidden" bind:this={cardDisc}>
                    <img src={songs[index]?.pic || LOCAL_COVER_URL} alt="封面" class="w-full h-full object-cover rounded-full" />
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="mc-songname font-bold text-sm text-text truncate">{songs[index]?.name || '加载中…'}</div>
                <div class="text-xs text-dim truncate">{songs[index]?.artist || ''}</div>
            </div>
        </div>

        <!-- 进度条 + 时间 -->
        <div class="mc-progress px-1">
            <div
                class="relative w-full h-1.5 bg-white/10 rounded-full group pointer"
                bind:this={progressEl}
                role="slider"
                aria-label="播放进度"
                onclick={seek}
            >
                <div class="absolute left-0 top-0 h-full bg-gradient-to-r from-gold to-gold-light rounded-full" style="width:{duration ? (currentTime / duration) * 100 : 0}%;"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-dim mt-1">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
            </div>
        </div>

        <!-- 控制行 -->
        <div class="mc-controls flex items-center justify-between px-1 select-none mt-1">
            <button class="pointer text-dim hover:text-gold transition-colors p-2" onclick={cycleMode} title="播放模式" aria-label="播放模式">
                {#if playMode === 'list'}
                    <i class="fas fa-repeat text-lg"></i>
                {:else if playMode === 'one'}
                    <span class="relative inline-block">
                        <i class="fas fa-repeat text-lg"></i>
                        <span class="absolute -top-1.5 -right-2 text-[9px] font-bold text-gold">1</span>
                    </span>
                {:else}
                    <i class="fas fa-shuffle text-lg"></i>
                {/if}
            </button>

            <button class="pointer text-text hover:text-gold transition-colors p-2" onclick={prev} title="上一首" aria-label="上一首">
                <i class="fas fa-backward-step text-2xl"></i>
            </button>

            <button class="pointer w-12 h-12 rounded-full bg-gradient-to-r from-gold-light to-gold text-bg flex items-center justify-center hover:shadow-[0_0_25px_rgba(0,212,170,0.35)] transition-all duration-300" onclick={toggle} title={playing ? '暂停' : '播放'} aria-label={playing ? '暂停' : '播放'}>
                <i class="fas {playing ? 'fa-pause' : 'fa-play'} text-xl"></i>
            </button>

            <button class="pointer text-text hover:text-gold transition-colors p-2" onclick={() => next()} title="下一首" aria-label="下一首">
                <i class="fas fa-forward-step text-2xl"></i>
            </button>

            <button class="pointer text-dim hover:text-gold transition-colors p-2" onclick={() => (drawerOpen = !drawerOpen)} title="播放列表" aria-label="播放列表">
                <i class="fas fa-list-ul text-lg"></i>
            </button>
        </div>

        <!-- 音量行 -->
        <div class="mc-volume flex items-center gap-2 mt-2 px-1">
            <button class="pointer text-dim hover:text-gold transition-colors p-1" onclick={toggleMute} title="静音" aria-label="静音">
                <i class="fas {muted || volume === 0 ? 'fa-volume-xmark' : 'fa-volume-high'}"></i>
            </button>
            <div class="relative flex-1 h-1 bg-white/10 rounded-full pointer" bind:this={volEl} role="slider" aria-label="音量" onclick={setVol}>
                <div class="absolute left-0 top-0 h-full bg-gold/70 rounded-full" style="width:{(muted ? 0 : volume) * 100}%;"></div>
            </div>
        </div>

        <!-- 歌单抽屉 -->
        {#if drawerOpen}
            <div class="mt-3 pt-2 border-t border-white/10 max-h-48 overflow-y-auto custom-scrollbar">
                {#each songs as s, i}
                    <button
                        type="button"
                        class="mc-song-item pointer w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all duration-200 {i === index ? 'bg-gold/10 text-gold' : 'text-text hover:bg-white/5'}"
                        onclick={() => playSong(i)}
                    >
                        <img src={s.pic || LOCAL_COVER_URL} alt="" class="w-8 h-8 rounded-md object-cover shrink-0" />
                        <span class="flex-1 min-w-0">
                            <span class="block text-xs truncate">{s.name}</span>
                            <span class="block text-[10px] text-dim truncate">{s.artist}</span>
                        </span>
                        {#if i === index && playing}
                            <i class="fas fa-volume-high text-xs text-gold shrink-0"></i>
                        {:else if i === index}
                            <i class="fas fa-pause text-xs text-gold shrink-0"></i>
                        {/if}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
{/if}