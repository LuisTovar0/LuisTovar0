<script lang="ts">
    import { onMount } from 'svelte';
    import animationData from '$lib/data/animation.json';

    let currentFrame = $state(0);
    const frames = animationData as string[][];
    const fps = 7;
    const interval = 1000 / fps;

    onMount(() => {
        const timer = setInterval(() => {
            currentFrame = (currentFrame + 1) % frames.length;
        }, interval);

        return () => clearInterval(timer);
    });
</script>

<div class="animation-container w-full flex justify-center lg:justify-start">
    <pre class="font-mono text-[1.2vw] lg:text-[0.75rem] leading-[1] whitespace-pre select-none text-[#D1AC00] opacity-70 transition-all duration-75"
    >{frames[currentFrame].join('\n')}</pre>
</div>

<style>
    pre {
        font-family: 'Courier New', Courier, monospace;
        text-shadow: 0 0 8px rgba(209, 172, 0, 0.4);
    }
</style>
