<script lang="ts">
    import { page } from "$app/state";
    import linksData from "$lib/data/links.json";

    const sectionId = $derived(page.params.section);
    const section = $derived(linksData.sections.find(s => s.id === sectionId));
</script>

{#if section}
    <ul class="flex flex-col relative">
        {#each section.links as link}
            <li class="relative z-10">
                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group block border-t border-base-cream/10 py-6 first:border-t-0 first:pt-2 transition-all duration-500"
                >
                    <div class="flex items-baseline justify-between gap-4">
                        <span class="text-base font-semibold tracking-[0.18em] uppercase text-base-cream/85 transition-colors duration-500 group-hover:text-accent-gold [text-shadow:0_0_15px_#0C1618,0_0_30px_#0C1618,0_0_45px_#0C1618]">
                            {link.label}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 -translate-x-3 text-accent-gold opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 drop-shadow-[0_0_8px_rgba(12,22,24,1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                    {#if 'description' in link && link.description}
                        <p class="mt-2 text-sm font-light italic tracking-wide text-base-cream/50 transition-colors duration-500 group-hover:text-base-cream/70 [text-shadow:0_0_10px_#0C1618,0_0_20px_#0C1618,0_0_30px_#0C1618]">
                            {link.description}
                        </p>
                    {/if}
                </a>
            </li>
        {/each}
    </ul>
{:else}
    <div class="py-10">
        <h2 class="mb-3 text-xl font-semibold">Section not found</h2>
        <a href="/" class="text-sm uppercase tracking-[0.2em] text-accent-gold">Go back home</a>
    </div>
{/if}
