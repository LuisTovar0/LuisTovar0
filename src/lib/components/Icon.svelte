<script lang="ts">
    interface Props {
        name: string;
        className?: string;
        /**
         * Accessible name for the icon. When provided the icon is exposed to
         * assistive tech as an image; when omitted it is treated as decorative
         * (e.g. when it sits next to a visible text label).
         */
        label?: string;
    }

    let { name, className = "", label }: Props = $props();
</script>

{#if label}
    <div
        class="icon-base {className}"
        style="--icon-url: url('/icons/{name}.svg')"
        role="img"
        aria-label={label}
    ></div>
{:else}
    <div
        class="icon-base {className}"
        style="--icon-url: url('/icons/{name}.svg')"
        aria-hidden="true"
    ></div>
{/if}

<style lang="scss">
    .icon-base {
        @apply inline-block;
        background-color: currentColor;
        mask-image: var(--icon-url);
        -webkit-mask-image: var(--icon-url);
        mask-repeat: no-repeat;
        mask-position: center;
        mask-size: contain;
        /* Ensure it takes up space if parent defines it, or default to current em */
        min-width: 1em;
        min-height: 1em;
    }
</style>
