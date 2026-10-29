<script lang="ts">
  import { page } from '$app/state';
  import SectionLinks from '$lib/components/SectionLinks.svelte';
</script>

<SectionLinks sectionId={page.params.section} />
