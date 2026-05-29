<script lang="ts">
    import "../app.scss";
    import linksData from "$lib/data/links.json";
    import { page } from "$app/state";
    import StlAnimation from "$lib/components/StlAnimation.svelte";
    import { onMount } from "svelte";

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    let hasNeon = $state(true);

    onMount(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            const flip = () => hasNeon = !hasNeon;
            const flicker = () => {
                flip();
                setTimeout(flip, 100);
                setTimeout(flip, 160);
                setTimeout(flip, 240);
            };

            const flickerInterval = setInterval(flicker, 5000);
            const initialFlicker = setTimeout(flicker, 1000);

            return () => {
                clearInterval(flickerInterval);
                clearTimeout(initialFlicker);
            };
        }
    });

    const sections = linksData.sections;
</script>

<div class="app-shell selection-gold">
    <!-- Background: Animation is a subtle quirk behind liquid glass -->
    <div class="bg-layer">
        <div class="bg-radial bg-gradient-radial"></div>
        {#if page.url.pathname !== '/animations'}
        <div class="bg-animation">
            <StlAnimation />
        </div>
        {/if}
        <!-- Grain Texture -->
        <div class="grain-texture"></div>
    </div>

    <!-- Asymmetric Editorial Layout -->
    <div class="scroll-area no-scrollbar">
        {#if page.url.pathname === '/animations'}
            <main class="animations-main">
                {@render children?.()}
            </main>
        {:else}
        <div class="editorial-container">
            <div class="editorial-grid">

                <h1 class="area-title" class:neon-text={hasNeon}>
                    Luís<br/> Tovar
                </h1>

                <header class="area-nav">
                    <nav class="nav-list">
                        {#each sections as section, i}
                            {@const isActive = page.url.pathname === `/${section.id}`}
                            <a
                                href="/{section.id}"
                                class="nav-link group"
                                class:nav-active={isActive}
                                style="animation: nav-item-reveal 0.8s var(--easing-expo) {i * 0.1}s both"
                            >
                                <span class="nav-indicator hidden xl:block"></span>
                                <span class="nav-text" class:neon-text={isActive && hasNeon}>{section.label}</span>
                                <span class="nav-rule xl:hidden"></span>
                            </a>
                        {/each}
                    </nav>
                </header>

                <main class="area-links">
                    {@render children?.()}
                </main>

                <div class="area-controls">
                    <button type="button" class="control-btn">Lang</button>
                    <button type="button" class="control-btn">Dark Mode</button>
                </div>
            </div>
        </div>
        {/if}
    </div>
</div>

<style lang="scss">
    :root {
        --color-gold: oklch(74.6% 0.17 84.1);
        --color-cream: oklch(96.7% 0.03 89.2);
        --easing-expo: cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* --- Shell & background layers --- */
    .app-shell {
        @apply h-[100dvh] w-full bg-base-dark text-base-cream relative overflow-hidden;
    }

    .bg-layer {
        @apply fixed inset-0 z-0 pointer-events-none;
    }

    .bg-radial {
        @apply absolute inset-0 opacity-40;
    }

    .bg-animation {
        @apply absolute inset-0 opacity-20 motion-safe:animate-pulse-slow;
    }

    /* --- Scroll container & layout regions --- */
    .scroll-area {
        @apply relative z-10 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col;
        @apply lg:block;
    }

    .animations-main {
        @apply w-full min-h-full py-12 px-6 sm:px-12 lg:px-24;
    }

    .editorial-container {
        @apply max-w-7xl mx-auto flex flex-col min-h-full w-full px-6;
        @apply sm:px-12;
        @apply lg:px-24;
        @apply xl:h-full;
    }

    .editorial-grid {
        @apply grid grid-cols-1 pt-12 z-20 flex-1;
        @apply xl:grid-cols-2 xl:grid-rows-2 xl:items-start xl:gap-y-16 xl:gap-x-40 xl:p-0;
    }

    .area-title {
        @apply text-center text-[clamp(3.5rem,15vw,10rem)] leading-[0.85] mb-8 pointer-events-none;
        @apply xl:col-start-1 xl:row-start-1 xl:place-self-end xl:text-right xl:mb-0;
    }

    .area-nav {
        @apply z-40 flex justify-center mb-10;
        @apply xl:col-start-2 xl:row-start-1 xl:place-self-end xl:justify-self-start xl:sticky xl:top-[10vh] xl:pt-2 xl:block xl:mb-0;
    }

    .area-links {
        @apply w-full max-w-xl mx-auto flex-1 py-2;
        @apply xl:col-start-2 xl:row-start-2 xl:place-self-start xl:mx-0 xl:py-0;
    }

    .area-controls {
        @apply flex justify-center gap-3 py-10 mt-auto;
        @apply xl:col-start-1 xl:row-start-2 xl:place-self-start xl:justify-self-end xl:justify-end xl:py-0 xl:mt-0;
    }

    /* --- Navigation --- */
    .nav-list {
        @apply inline-flex gap-6 text-xs;
        @apply sm:gap-9;
        @apply xl:grid xl:grid-flow-row xl:auto-rows-max xl:gap-4 xl:justify-items-start;
    }

    .nav-link {
        @apply flex items-center justify-center relative text-[0.7rem] font-semibold tracking-[0.25em] uppercase text-base-cream/30 whitespace-nowrap no-underline py-2 px-1 cursor-pointer;
        @apply xl:justify-start xl:px-0;
        transition: all 0.7s var(--easing-expo);
        
        &.nav-active {
            @apply text-base-cream;
        }
    }

    .nav-text {
        @apply relative z-10;
        transition: shadow 0.3s var(--easing-expo);
    }

    .control-btn {
        @apply text-[0.65rem] font-medium tracking-[0.2em] uppercase text-base-cream/40 whitespace-nowrap py-2 px-4 rounded-full border border-base-cream/10 bg-base-dark/30 backdrop-blur-xl cursor-pointer;
        transition: color 0.5s var(--easing-expo), border-color 0.5s var(--easing-expo);
    }

    @media (hover: hover) {
        .control-btn:hover {
            @apply text-base-cream/80 border-base-cream/25;
        }
    }

    @keyframes nav-item-reveal {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Desktop Indicator (marginal editorial rule, sits left of the flush label) */
    .nav-indicator {
        @apply absolute h-[1px] w-5 bg-accent-gold origin-left opacity-0;
        left: -2rem;
        top: 50%;
        transform: translateY(-50%) scaleX(0);
        transition: transform 0.7s var(--easing-expo), opacity 0.7s var(--easing-expo), box-shadow 0.7s var(--easing-expo);
    }

    /* Mobile indicator: a centered gold rule beneath the label, the horizontal-axis analog of the desktop marginal rule */
    .nav-rule {
        @apply absolute bottom-0 left-1/2 h-[1px] w-6 bg-accent-gold opacity-0;
        transform: translateX(-50%) scaleX(0);
        transition: transform 0.7s var(--easing-expo), opacity 0.7s var(--easing-expo), box-shadow 0.7s var(--easing-expo);
    }

    .nav-active .nav-rule {
        @apply opacity-100;
        transform: translateX(-50%) scaleX(1);
        box-shadow: 0 0 20px var(--color-gold);
    }

    @media (hover: hover) {
        .nav-link:not(.nav-active):hover {
            @apply text-base-cream/60;
        }
        .nav-link:not(.nav-active):hover .nav-indicator {
            @apply opacity-40;
            transform: translateY(-50%) scaleX(0.6);
            box-shadow: 0 0 15px var(--color-gold);
        }
    }

    .nav-active .nav-indicator {
        @apply opacity-100;
        transform: translateY(-50%) scaleX(1);
        box-shadow: 0 0 20px var(--color-gold);
    }

    @media (prefers-reduced-motion: reduce) {
        .nav-link, .nav-indicator, .nav-rule, .control-btn {
            transition: none !important;
            animation: none !important;
        }
    }
</style>