<script lang="ts">
    import { onMount } from "svelte";
    import type { TransitionConfig } from "svelte/transition";
    import { swapIn, swapOut } from "$lib/motion";

    interface Props {
        /** The (already-translated) text to render. */
        text: string;
        /** Stagger delay in ms for the incoming text — its position in a list. */
        delay?: number;
        /** Stagger delay in ms for the outgoing text. Defaults to `delay`. */
        outDelay?: number;
        /** Block-level (full-width) overlap instead of inline. */
        block?: boolean;
    }

    let { text, delay = 0, outDelay, block = false }: Props = $props();
    let resolvedOutDelay = $derived(outDelay ?? delay);

    // Suppress the intro on first paint: transitions are only armed after mount,
    // so the initial render is instant. Keying on `text` (below) means only a real
    // wording change animates — words identical across two languages stay put, and
    // a fresh route mounts new instances (armed=false), so navigation never animates.
    let armed = false;
    onMount(() => {
        armed = true;
    });

    type Trans = (node: Element, params?: { delay?: number }) => TransitionConfig;
    const gate =
        (fn: Trans): Trans =>
        (node, params) =>
            armed ? fn(node, params) : { duration: 0 };
</script>

<span class="swap" class:block>
    <!-- A hidden copy of the *current* text reserves the box, so the container
         always sizes to the new language immediately rather than holding the old
         or maximum width while the runs crossfade. That keeps the box authoritative
         for the nav FLIP, and visibility:hidden keeps it out of the a11y tree. -->
    <span class="swap-sizer" aria-hidden="true">{text}</span>
    {#key text}
        <span class="swap-item" in:gate(swapIn)={{ delay }} out:gate(swapOut)={{ delay: resolvedOutDelay }}>{text}</span>
    {/key}
</span>

<style>
    /* The sizer sits in normal flow and defines the box; the outgoing and incoming
       runs are absolute layers stacked over it, so they crossfade in place with no
       reflow as one language's word width hands off to the next (Latin <-> Korean
       differ a lot). Inline by default to sit in running text; `block` spans a
       full-width line (descriptions, the not-found copy). */
    .swap {
        position: relative;
        display: inline-block;
    }
    .swap.block {
        display: block;
    }
    .swap-sizer {
        visibility: hidden;
    }
    .swap-item {
        position: absolute;
        inset: 0;
    }
</style>
