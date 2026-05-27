<script lang="ts">
    import "../app.scss";
    import linksData from "$lib/data/links.json";
    import { page } from "$app/state";
    import StlAnimation from "$lib/components/StlAnimation.svelte";

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    let hasNeon = $state(true);
    const flip = () => hasNeon = !hasNeon;
    const flicker = () => {
        flip();
        setTimeout(flip, 100);
        setTimeout(flip, 160);
        setTimeout(flip, 240);
    };

    $effect(() => {
        const flickerInterval = setInterval(flicker, 5000);
        const initialFlicker = setTimeout(flicker, 1000);
        return () => {
            clearInterval(flickerInterval);
            clearTimeout(initialFlicker);
        };
    });

    const sections = linksData.sections;
</script>

<div class="h-[100dvh] w-full bg-[#0C1618] text-[#faf4d3] relative overflow-hidden selection:bg-[#D1AC00] selection:text-[#0C1618]">
    <!-- Atmospheric Background Layers -->
    <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 opacity-40" 
             style="background: radial-gradient(circle at 15% 25%, #004643 0%, transparent 45%), radial-gradient(circle at 85% 75%, #002e2b 0%, transparent 40%);">
        </div>
        <!-- Grain Texture -->
        <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay grain-texture"></div>
    </div>

    <!-- Content Wrapper: Columnar Shift -->
    <div class="relative z-10 w-full h-full grid grid-cols-1 grid-rows-[auto,minmax(0,1fr),auto] lg:grid-rows-none lg:grid-cols-[1fr,1.2fr] gap-0">
        
        <!-- Left Column: Branding & Nav -->
        <header class="flex flex-col justify-center lg:justify-start pt-10 lg:pt-32 px-8 lg:px-16 lg:h-full min-h-0 text-center lg:text-left">
            <h1 class="text-[clamp(4.5rem,12vw,12rem)] leading-[0.82] transition-all duration-75 mb-12 lg:mb-20" class:neon={hasNeon}>
                Luís Tovar
            </h1>

            <nav class="flex flex-wrap justify-center lg:justify-start gap-3 lg:gap-6">
                {#each sections as section}
                    <a 
                        href="/{section.id}" 
                        class="px-5 py-2 rounded-full border border-[#D1AC00]/10 bg-[#D1AC00]/5 text-xs font-medium tracking-[0.15em] uppercase transition-all duration-500 hover:bg-[#D1AC00]/20 hover:border-[#D1AC00]/40 hover:shadow-[0_0_20px_rgba(209,172,0,0.15)]"
                        class:active={page.url.pathname === `/${section.id}`}
                    >
                        {section.label}
                    </a>
                {/each}
            </nav>

            <div class="hidden lg:block mt-12 lg:mt-20 overflow-hidden">
                <StlAnimation />
            </div>
        </header>

        <!-- Right Column: Content -->
        <main class="flex items-stretch lg:items-center justify-center lg:justify-start min-h-0 p-6 lg:p-20 lg:pt-40 lg:h-full overflow-hidden">
            <div class="w-full max-w-xl h-full lg:h-auto max-h-full lg:min-h-[420px] flex flex-col bg-[#004643]/10 backdrop-blur-2xl border border-[#faf4d3]/5 rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                <div class="links-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                    {@render children?.()}
                </div>
            </div>
        </main>

        <!-- Animation: mobile-only, appears below links -->
        <div class="lg:hidden px-8 pt-4 pb-6 max-h-[18vh] overflow-hidden flex justify-center">
            <StlAnimation />
        </div>
    </div>
</div>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap');

    :global(html), :global(body) {
        height: 100%;
        overflow: hidden;
        overscroll-behavior: none;
    }

    :global(body) {
        font-family: 'Urbanist', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #0C1618;
        letter-spacing: 0.01em;
        -webkit-font-smoothing: antialiased;
    }

    .links-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(209, 172, 0, 0.3) transparent;
    }

    .links-scroll::-webkit-scrollbar {
        width: 6px;
    }

    .links-scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    .links-scroll::-webkit-scrollbar-thumb {
        background-color: rgba(209, 172, 0, 0.25);
        border-radius: 9999px;
    }

    .links-scroll::-webkit-scrollbar-thumb:hover {
        background-color: rgba(209, 172, 0, 0.45);
    }

    h1 {
        font-family: 'Instrument Serif', serif;
        font-style: italic;
        font-weight: 400;
        letter-spacing: -0.03em;
        line-height: 0.85;
    }

    .neon {
        --neon: #D1AC00;
        color: #faf4d3;
        text-shadow: 
            0 0 12px rgba(250, 244, 211, 0.2), 
            0 0 25px var(--neon), 
            0 0 50px rgba(209, 172, 0, 0.4);
    }

    .active {
        background: #D1AC00;
        color: #0C1618;
        font-weight: 700;
        border-color: #D1AC00;
        box-shadow: 0 0 25px rgba(209, 172, 0, 0.3);
    }

    .grain-texture {
        background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23n)"/%3E%3C/svg%3E');
    }
    </style>