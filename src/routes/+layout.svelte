<script lang="ts">
    import "./+layout.scss";
    import { page } from "$app/state";
    import StlAnimation from "$lib/components/StlAnimation.svelte";
    import Swap from "$lib/components/Swap.svelte";
    import ThemeIcon from "$lib/components/ThemeIcon.svelte";
    import { locale, localeLabels, t } from "$lib/i18n";
    import { ui } from "$lib/i18n/ui";
    // Preload the Urbanist weights present at first paint (300 descriptions, 600 nav/labels).
    // The @font-face rules ship in the JS-bundled CSS, so without this the font is only
    // discovered after that CSS loads and `font-display: swap` flashes the fallback first.
    // `?url` resolves to the same hashed asset the @font-face src points at; the SSR'd
    // <link rel="preload"> below kicks the fetch off in the initial HTML instead.
    import urbanist300 from "@fontsource/urbanist/files/urbanist-latin-300-normal.woff2?url";
    import urbanist600 from "@fontsource/urbanist/files/urbanist-latin-600-normal.woff2?url";
    import { createLayoutState } from './layout.svelte.js';

    const layout = createLayoutState();
    let { children } = $props();
</script>

<svelte:head>
    <link rel="preload" href={urbanist300} as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href={urbanist600} as="font" type="font/woff2" crossorigin="anonymous" />
    <meta name="description" content="Personal website of Luís Tovar" />
    <meta property="og:title" content="Luís Tovar" />
    <meta property="og:description" content="Personal website of Luís Tovar" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={page.url.href} />
    <meta property="og:image" content="{page.url.origin}/screenshot.png" />
    <meta property="og:image:alt" content="Luís Tovar's personal website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Luís Tovar" />
    <meta name="twitter:description" content="Personal website of Luís Tovar" />
    <meta name="twitter:image" content="{page.url.origin}/screenshot.png" />
</svelte:head>

<div class="app-shell selection-gold" class:no-transitions={!layout.mounted}>
    <div class="bg-layer">
        <div class="bg-radial bg-gradient-radial"></div>
        {#if page.url.pathname !== '/animations'}
            <!-- Kept mounted across theme toggles (hidden, not destroyed, in light mode)
                 so the data loads once at startup and the frame loop keeps advancing. -->
            <div class="bg-animation" class:is-hidden={layout.isLight}>
                <StlAnimation />
            </div>
        {/if}
        <!-- Grain Texture -->
        <div class="grain-texture"></div>
    </div>

    <div class="scroll-area no-scrollbar">
        {#if page.url.pathname === '/animations'}
            <main class="animations-main">
                {@render children?.()}
            </main>
        {:else}
            <div class="editorial-container">
                <div class="editorial-grid">
                    <h1 class="area-title neon-text" lang="en">
                        <span>Luís<br />Tovar</span>
                    </h1>

                    <header class="area-nav">
                        <nav class="nav-list" bind:this={layout.navListEl}>
                            {#each layout.sections as section, i}
                                {@const isActive = page.url.pathname === `/${ section.id }`}
                                <a href="/{section.id}" class="nav-link group" class:nav-active={isActive}>
                                    <span class="nav-indicator hidden xl:block"></span>
                                    <span class="nav-text" class:neon-text={isActive}>
                                        <Swap text={t(section.label, $locale)} delay={i * 45} />
                                    </span>
                                    <span class="nav-rule xl:hidden"></span>
                                </a>
                            {/each}
                        </nav>
                    </header>

                    <main
                            class="area-links no-scrollbar"
                            class:fade-top={layout.canScrollUp}
                            class:fade-bottom={layout.canScrollDown}
                            bind:this={layout.linksEl}
                            onscroll={layout.updateScrollFades}
                    >
                        {@render children?.()}
                    </main>

                    <div class="area-controls" bind:this={layout.controlsEl}>
                        <button type="button" class="control-btn control-btn--lang"
                                onclick={layout.changeLanguage} onpointerenter={layout.warmKoreanFonts}
                                onfocus={layout.warmKoreanFonts} aria-label={ui('language_a11y', $locale)}>
                            <Swap text={localeLabels[$locale]} />
                        </button>
                        <button type="button" class="control-btn" onclick={layout.toggleTheme}
                                aria-label={layout.isLight ? ui('theme_a11y_toDark', $locale) : ui('theme_a11y_toLight', $locale)}>
                            <ThemeIcon className="control-icon" />
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
