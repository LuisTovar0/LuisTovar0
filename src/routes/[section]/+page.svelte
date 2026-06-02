<script lang="ts">
    import { page } from "$app/state";
    import linksData from "$lib/data/links.json";
    import Icon from "$lib/components/Icon.svelte";

    const sectionId = $derived(page.params.section);
    const section = $derived(linksData.sections.find(s => s.id === sectionId));
</script>

{#if section}
    <ul class="link-list">
        {#each section.links as link}
            <li class="link-item">
                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-row group"
                >
                    <div class="link-head">
                        <span class="link-label">{link.label}</span>
                        {#if 'icon' in link && link.icon}
                            <Icon name={link.icon} className="link-icon" />
                        {/if}
                    </div>
                    {#if 'description' in link && link.description}
                        <p class="link-desc">{link.description}</p>
                    {/if}
                </a>
            </li>
        {/each}
    </ul>
{:else}
    <div class="not-found">
        <h2 class="not-found-title">Section not found</h2>
        <a href="/" class="not-found-link">Go back home</a>
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
        @apply block border-t border-base-cream/10 py-6 transition-all duration-500;
        @apply first:border-t-0 first:pt-0;
    }

    .link-head {
        @apply flex items-baseline justify-between gap-4;
    }

    :global(.link-icon) {
        @apply h-4 w-4 opacity-70 transition-all duration-500 text-base-cream/85;
        @apply group-hover:opacity-100 group-hover:text-accent-gold;
        filter: drop-shadow(0 0 10px rgba(12, 22, 24, 0.5));
    }

    .link-label {
        @apply text-fluid-base 3xl:text-fluid-base-hd font-semibold tracking-[0.18em] uppercase text-base-cream/85 transition-colors duration-500;
        @apply group-hover:text-accent-gold;
        text-shadow: 0 0 15px #0C1618, 0 0 30px #0C1618, 0 0 45px #0C1618;
    }

    .link-desc {
        @apply mt-2 text-fluid-sm 3xl:text-fluid-sm-hd font-light italic tracking-wide text-base-cream/50 transition-colors duration-500;
        @apply group-hover:text-base-cream/70;
        text-shadow: 0 0 10px #0C1618, 0 0 20px #0C1618, 0 0 30px #0C1618;
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
