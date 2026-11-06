<script lang="ts">
  import SectionLinks from '$lib/components/SectionLinks.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<SectionLinks sectionId={data.sectionId} />
