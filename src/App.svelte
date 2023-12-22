<script lang="ts">
  import {detect} from "detect-browser";

  const os = detect().os;
  const isMobile = os === "Android OS" || os === "iOS";
</script>

{#if isMobile}
    You're on mobile
{:else}
    You're on a computer
{/if}

<style>
</style>
