<script lang="ts">
    interface Props {
        name: string;
        className?: string;
    }

    let { name, className = "" }: Props = $props();
</script>

<div
    class="icon-base {className}"
    style="--icon-url: url('/icons/{name}.svg')"
    aria-hidden="true"
></div>

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
