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

<div class="h-[100dvh] w-full bg-base-dark text-base-cream relative overflow-hidden selection-gold">
    <!-- Background: Animation is a subtle quirk behind liquid glass -->
    <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 opacity-40 bg-gradient-radial"></div>
        {#if page.url.pathname !== '/animations'}
        <div class="absolute inset-0 opacity-20 motion-safe:animate-pulse-slow">
            <StlAnimation />
        </div>
        {/if}
        <!-- Grain Texture -->
        <div class="grain-texture"></div>
    </div>

    <!-- Asymmetric Editorial Layout -->
    <div class="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col lg:block">
        {#if page.url.pathname === '/animations'}
            <main class="w-full min-h-full py-12 px-6 sm:px-12 lg:px-24">
                {@render children?.()}
            </main>
        {:else}
        <div class="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[1fr,1.2fr] lg:gap-x-12 gap-y-0 min-h-full w-full px-6 sm:px-12 lg:px-24">
            
            <div class="lg:col-span-1 pt-12 lg:pt-[10vh] z-20">
                <h1 class="text-[clamp(4rem,15vw,10rem)] leading-[0.85] mb-4 lg:mb-8 text-left pointer-events-none" class:neon-text={hasNeon}>
                    Luís<br class="hidden sm:block lg:hidden" /> Tovar
                </h1>
            </div>
            <div class="hidden lg:block"></div>

            <header class="flex flex-col lg:sticky lg:top-12 lg:h-fit z-40 shrink-0">
                <nav class="fixed bottom-8 left-1/2 -translate-x-1/2 lg:relative lg:bottom-auto lg:left-auto lg:translate-x-0 flex flex-row lg:flex-col gap-2 lg:gap-4 p-1.5 lg:p-0 bg-base-dark/40 backdrop-blur-2xl border border-base-cream/10 rounded-full lg:rounded-none lg:border-none lg:bg-transparent lg:backdrop-blur-none z-50">
                    {#each sections as section, i}
                        {@const isActive = page.url.pathname === `/${section.id}`}
                        <a
                            href="/{section.id}"
                            class="nav-link group"
                            class:nav-active={isActive}
                            style="animation: nav-item-reveal 0.8s var(--easing-expo) {i * 0.1}s both"
                        >
                            <span class="nav-indicator hidden lg:block"></span>
                            <span class="nav-text" class:neon-text={isActive && hasNeon}>{section.label}</span>
                            {#if isActive}
                                <span class="nav-bloom block lg:hidden"></span>
                            {/if}
                        </a>
                    {/each}
                </nav>
            </header>

            <main class="flex-1 w-full max-w-xl py-8 lg:pt-0 pb-40 lg:pb-32">
                {@render children?.()}
            </main>
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

    .nav-link {
        @apply flex items-center relative text-[0.7rem] font-semibold tracking-[0.25em] uppercase text-base-cream/30 whitespace-nowrap no-underline py-2.5 px-5 lg:px-0 lg:py-2 cursor-pointer;
        transition: all 0.7s var(--easing-expo);
        
        &.nav-active {
            @apply text-base-cream;
        }
    }

    .nav-text {
        @apply relative z-10;
        transition: shadow 0.3s var(--easing-expo);
    }

    @keyframes nav-item-reveal {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Desktop Indicator */
    .nav-indicator {
        @apply h-[1px] bg-accent-gold mr-0 opacity-0;
        width: 0;
        transition: all 0.7s var(--easing-expo);
    }

    /* Mobile Bloom Indicator */
    .nav-bloom {
        @apply absolute inset-0 rounded-full bg-base-cream/5 border border-base-cream/10 z-0;
        box-shadow: 
            inset 0 0 10px oklch(from var(--color-cream) l c h / 0.05),
            0 0 20px oklch(from var(--color-gold) l c h / 0.1);
        animation: bloom-reveal 0.6s var(--easing-expo) forwards;
    }

    @keyframes bloom-reveal {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }

    @media (hover: hover) {
        .nav-link:not(.nav-active):hover {
            @apply text-base-cream/60;
        }
        .nav-link:hover .nav-indicator {
            @apply w-6 mr-4 opacity-100;
            box-shadow: 0 0 15px var(--color-gold);
        }
    }

    .nav-active .nav-indicator {
        @apply w-12 mr-4 opacity-100;
        box-shadow: 0 0 20px var(--color-gold);
    }

    @media (prefers-reduced-motion: reduce) {
        .nav-link, .nav-indicator, .nav-bloom {
            transition: none !important;
            animation: none !important;
        }
    }
</style>