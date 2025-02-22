<script lang="ts">
    import "../app.scss";
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

{@render children?.()}