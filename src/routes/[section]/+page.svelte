<script lang="ts">
    import { page } from "$app/state";
    import linksData from "$lib/data/links.json";
    import Icon from "$lib/components/Icon.svelte";
    import Swap from "$lib/components/Swap.svelte";
    import { locale, t } from "$lib/i18n";
    import { ui } from "$lib/i18n/ui";

    const sectionId = $derived(page.params.section);
    const section = $derived(linksData.sections.find(s => s.id === sectionId));
</script>

{#if section}
    <ul class="link-list">
        {#each section.links as link, i}
            {@const stagger = Math.min(i, 8) * 45}
            <li class="link-item">
                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-row group"
                >
                    <div class="link-head">
                        <span class="link-label">
                            <Swap text={t(link.label, $locale)} delay={stagger} />
                        </span>
                        {#if 'icon' in link && link.icon}
                            <Icon name={link.icon} className="link-icon" />
                        {/if}
                    </div>
                    {#if 'description' in link && link.description}
                        <p class="link-desc">
                            <Swap text={t(link.description, $locale)} delay={stagger} block />
                        </p>
                    {/if}
                </a>
            </li>
        {/each}
    </ul>
{:else}
    <div class="not-found">
        <h2 class="not-found-title">
            <Swap text={ui('notFoundTitle', $locale)} block />
        </h2>
        <a href="/" class="not-found-link">
            <Swap text={ui('notFoundLink', $locale)} delay={45} />
        </a>
    </div>
{/if}

<style lang="scss">
    .link-list {
        @apply flex flex-col relative;
    }

    .link-item {
        @apply relative z-10;
    }

    .link-row {
        @apply block border-t border-base-cream/10 my-6;
        @apply first:border-t-0 first:mt-0;
        transition: border-color 0.5s, background-color 0.5s, box-shadow 0.5s;

        &:focus-visible {
            @apply outline-none rounded;
            box-shadow: 0 0 0 2px var(--color-accent), 0 0 16px var(--glow-secondary);
        }
    }

    .link-row:focus-visible .link-label {
        @apply text-accent-gold;
    }

    .link-row:focus-visible .link-desc {
        @apply text-base-cream/70;
    }

    :global(.link-row:focus-visible .link-icon) {
        @apply opacity-100 text-accent-gold;
    }

    .link-head {
        @apply flex items-baseline justify-between gap-4;
    }

    :global(.link-icon) {
        @apply h-4 w-4 opacity-70 text-brand/85;
        @apply group-hover:opacity-100 group-hover:text-accent-gold;
        transition: color 0.5s, opacity 0.5s;
        filter: drop-shadow(0 0 10px var(--shadow-icon));
    }

    /* Korean glyphs render larger via the size-adjust @font-face (app.scss), so these
       read straight off the fluid tokens with no per-locale scaling. */
    .link-label {
        @apply text-fluid-base 3xl:text-fluid-base-hd font-semibold tracking-[0.18em] uppercase text-base-cream/85 transition-colors duration-500;
        @apply group-hover:text-accent-gold;
        text-shadow: 0 0 15px var(--shadow-bg), 0 0 30px var(--shadow-bg), 0 0 45px var(--shadow-bg);
    }

    .link-desc {
        @apply mt-2 text-fluid-sm 3xl:text-fluid-sm-hd font-light italic tracking-wide text-base-cream/50 transition-colors duration-500;
        @apply group-hover:text-base-cream/70;
        text-shadow: 0 0 10px var(--shadow-bg), 0 0 20px var(--shadow-bg), 0 0 30px var(--shadow-bg);
    }

    .not-found {
        @apply py-10;
    }

    .not-found-title {
        @apply mb-3 text-fluid-lg 3xl:text-fluid-lg-hd font-semibold;
    }

    .not-found-link {
        @apply text-fluid-sm 3xl:text-fluid-sm-hd uppercase tracking-[0.2em] text-accent-gold;
    }
</style>
