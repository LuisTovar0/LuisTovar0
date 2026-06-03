<script lang="ts">
    import { page } from "$app/state";
    import { locale } from "$lib/i18n";
    import { ui } from "$lib/i18n/ui";
</script>

<div class="error-wrap">
    <p class="error-status">{page.status}</p>
    <h2 class="error-title">{ui('notFoundTitle', $locale)}</h2>
    <a href="/" class="error-link">{ui('notFoundLink', $locale)}</a>
</div>

<style lang="scss">
    .error-wrap {
        @apply py-10;
    }

    .error-status {
        @apply mb-2 font-mono text-base-cream/30;
        font-size: clamp(0.75rem, 1.5vw, 1rem);
    }

    .error-title {
        @apply mb-3 font-semibold;
        font-size: clamp(1rem, 2vw, 1.5rem);
    }

    .error-link {
        @apply uppercase tracking-[0.2em] text-accent-gold;
        font-size: clamp(0.75rem, 1.5vw, 1rem);
    }
</style>
