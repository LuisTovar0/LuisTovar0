<script lang="ts">
    import { onMount } from 'svelte';

    type Manifest = {
        fps: number;
        frames: number;
        variants: { name: string; shape: string; pixelAspect: number; w: number; h: number; file: string }[];
    };
    type VariantData = { w: number; h: number; frames: string[][]; pixelAspect: number };

    let manifest = $state<Manifest | null>(null);
    let animations = $state<(VariantData & { name: string, shape: string })[]>([]);
    let currentFrame = $state(0);
    let fontSize = $state(10);
    let reduceMotion = false;

    onMount(() => {
        reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let timer: ReturnType<typeof setInterval> | undefined;

        (async () => {
            const res = await fetch(`/animation/manifest.json`);
            manifest = await res.json();
            
            if (manifest) {
                const loaded = await Promise.all(
                    manifest.variants.map(async (v) => {
                        const r = await fetch(`/animation/${v.file}`);
                        const data = await r.json();
                        return { ...data, name: v.name, shape: v.shape, pixelAspect: v.pixelAspect };
                    })
                );
                animations = loaded;

                if (!reduceMotion) {
                    timer = setInterval(() => {
                        currentFrame = (currentFrame + 1);
                    }, 1000 / (manifest.fps || 5));
                }
            }
        })();

        return () => {
            if (timer) clearInterval(timer);
        };
    });
</script>

<svelte:head>
    <title>Animations</title>
</svelte:head>

<div class="flex flex-col gap-12 max-w-full">
    <div class="sticky top-0 z-40 bg-[#0C1618]/90 backdrop-blur-md p-6 rounded-2xl border border-[#faf4d3]/10 flex flex-col gap-4">
        <h2 class="text-3xl font-bold font-serif italic text-[#D1AC00]">Animation Explorer</h2>
        <div class="flex items-center gap-4">
            <label for="font-size" class="text-sm font-semibold uppercase tracking-widest text-[#faf4d3]/60">Font Size: {fontSize}px</label>
            <input 
                id="font-size" 
                type="range" 
                min="2" 
                max="32" 
                bind:value={fontSize} 
                class="flex-1 accent-[#D1AC00]"
            />
        </div>
    </div>

    {#if animations.length === 0}
        <div class="text-[#faf4d3]/40 animate-pulse font-mono">Loading animations...</div>
    {:else}
        <div class="flex flex-col gap-24">
            {#each animations as anim}
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1 border-b border-[#faf4d3]/10 pb-2">
                        <h3 class="text-xl font-bold tracking-widest text-[#faf4d3] uppercase">{anim.name}</h3>
                        <div class="flex gap-4 text-xs font-mono text-[#faf4d3]/50">
                            <span>Shape: {anim.shape}</span>
                            <span>Grid: {anim.w}x{anim.h}</span>
                            <span>Frames: {anim.frames.length}</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-center w-full">
                        <div class="bg-[#121e21] rounded-xl border border-[#faf4d3]/10 inline-flex items-center justify-center overflow-hidden shadow-2xl" style="aspect-ratio: {anim.pixelAspect};">
                            <pre class="ascii text-[#D1AC00]" style="font-size: {fontSize}px;">{anim.frames[currentFrame % anim.frames.length].join('\n')}</pre>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .ascii {
        margin: 0;
        font-family: 'Courier New', Courier, monospace;
        line-height: 1;
        white-space: pre;
        user-select: none;
        text-shadow: 0 0 8px rgba(209, 172, 0, 0.45);
    }
</style>
