<script lang="ts">
    import { page } from "$app/state";
    import linksData from "$lib/data/links.json";

    const sectionId = $derived(page.params.section);
    const section = $derived(linksData.sections.find(s => s.id === sectionId));
</script>

<div class="p-8">
    {#if section}
        <div class="flex flex-col gap-4">
            {#each section.links as link}
                <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="group flex flex-col p-5 rounded-2xl bg-[#faf4d3]/[0.02] border border-[#faf4d3]/5 transition-all duration-500 hover:bg-[#D1AC00]/5 hover:border-[#D1AC00]/30 hover:translate-x-1 hover:shadow-[0_0_30px_rgba(209,172,0,0.05),inset_0_0_20px_rgba(209,172,0,0.02)]"
                >
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold tracking-[0.2em] uppercase text-[#faf4d3]/80 group-hover:text-[#D1AC00] transition-colors duration-500">
                            {link.label}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-[#D1AC00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                    {#if link.description}
                        <p class="text-xs font-light tracking-wide text-[#faf4d3]/30 mt-2 italic group-hover:text-[#faf4d3]/50 transition-colors duration-500">
                            {link.description}
                        </p>
                    {/if}
                </a>
            {/each}
        </div>
    {:else}
        <div class="text-center py-20">
            <h2 class="text-2xl font-bold mb-4">Section not found</h2>
            <a href="/" class="text-[#D1AC00] underline">Go back home</a>
        </div>
    {/if}
</div>
