// Gothic A1 (Hangul fallback) is self-declared in app.scss with `size-adjust` so
// Korean glyphs render larger than Latin; see the @font-face block there.
import "@fontsource/urbanist/300.css";
import "@fontsource/urbanist/500.css";
import "@fontsource/urbanist/600.css";
import "../app.scss";
import { browser } from "$app/environment";
import { page } from "$app/state";
import linksData from "$lib/data/links.json";
import { cycleLocale, initLocale, locale, locales } from "$lib/i18n";
import { onMount, tick } from "svelte";
import { get } from "svelte/store";

export function createLayoutState() {
  // Theme initialization: honour a saved choice first, otherwise fall back to
  // the OS/browser preference. Default to dark (false) on server.
  let initialIsLight = false;
  if (browser) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      initialIsLight = savedTheme === 'light';
    } else {
      initialIsLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    }
  }

  let isLight = $state(initialIsLight);
  let mounted = $state(false);

  // Scroll affordance for the (only) scrollable region, .area-links: fade its top
  // and/or bottom edge whenever there is more content to scroll that way.
  let linksEl: HTMLElement | undefined = $state();
  let canScrollUp = $state(false);
  let canScrollDown = $state(false);

  // Navigation reference
  let navListEl: HTMLElement | undefined = $state();
  let controlsEl: HTMLElement | undefined = $state();

  onMount(() => {
    // Locale initialization (always starts in Portuguese on every visit)
    initLocale();

    mounted = true;
  });

  const updateScrollFades = () => {
    const el = linksEl;
    if (!el) return;
    canScrollUp = el.scrollTop > 1;
    canScrollDown = Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight - 1;
  };

  $effect(() => {
    const el = linksEl;
    if (!el) return;
    // Re-measure when the content itself changes (route + locale switch link sets).
    page.url.pathname;
    // In Svelte 5, referencing the store with $ inside a component works,
    // but in a .svelte.ts module we can subscribe to it or just rely on
    // the template-level $locale to trigger re-renders of elements.
    // Since this effect is inside a module, we can access the value
    // via get(locale) or locale.subscribe if needed, but for reactivity
    // tracking of a store in a rune-based effect, we need to access its value.
    // Svelte 5 provides a way to track stores in runes:
    locale;

    updateScrollFades();
    const ro = new ResizeObserver(updateScrollFades);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    return () => ro.disconnect();
  });

  $effect(() => {
    if (!mounted) return;

    if (isLight) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  });

  const toggleTheme = () => {
    isLight = !isLight;
  };

  // Korean text falls back to Gothic A1 (the Latin fonts carry no Hangul). That
  // face is large and only fetched the first time Hangul is painted, so the first
  // switch to Korean would otherwise flash the system fallback before it swaps in.
  // Warm it ahead of time — the promise is cached so it only ever downloads once.
  // Weights mirror the visible Korean text: 300 (descriptions) and 600 (nav/labels);
  // 500 is declared but unused, so we skip its ~244KB.
  let koreanFontsPromise: Promise<unknown> | null = null;
  const warmKoreanFonts = () => {
    if (!browser || !('fonts' in document)) return Promise.resolve();
    if (!koreanFontsPromise) {
      const sample = '가힣'; // any Hangul triggers the unicode-range face
      koreanFontsPromise = Promise.all(
          [ 300, 600 ].map((w) => document.fonts.load(`${ w } 1em "Gothic A1"`, sample)),
      ).catch(() => {}); // never block the UI switch on a font fetch failure
    }
    return koreanFontsPromise;
  };

  const changeLanguage = async () => {
    // Block the flip-to-Korean until Gothic A1 is in memory so the Hangul paints
    // (and is FLIP-measured) in its final font — no fallback flash, no metric jump.
    const nextIsKorean =
        locales[(locales.indexOf(get(locale)) + 1) % locales.length] === 'ko';
    if (nextIsKorean) await warmKoreanFonts();

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The animated elements: nav links, controls, plus each link row in the scroll area.
    const items = [
      ...(navListEl ? (Array.from(navListEl.children) as HTMLElement[]) : []),
      ...(controlsEl ? (Array.from(controlsEl.children) as HTMLElement[]) : []),
      ...(linksEl ? (Array.from(linksEl.querySelectorAll('.link-item')) as HTMLElement[]) : []),
    ];

    // Reduced motion (or nothing to measure): just switch. The labels' own
    // crossfade is the gentle cue and the reflow snaps.
    if (reduce || items.length === 0) {
      cycleLocale();
      return;
    }

    // Cancel any in-flight glide first so we measure true layout positions, not
    // mid-animation transformed ones (rapid language clicks).
    for (const el of items)
      for (const a of el.getAnimations()) if (a.id === 'lang-flip' || a.id === 'lang-reveal') a.cancel();

    const first = items.map((el) => el.getBoundingClientRect());
    cycleLocale();
    await tick();

    for (let i = 0; i < items.length; i++) {
      const last = items[i].getBoundingClientRect();
      const dx = first[i].left - last.left;
      const dy = first[i].top - last.top;

      // Only animate items that actually shifted position. Items that stayed
      // put are left alone — no FLIP, no reveal — so they don't bob or fade.
      if (dx === 0 && dy === 0) continue;

      // FLIP animation for layout shifts
      const flip = items[i].animate(
          [ { transform: `translate(${ dx }px, ${ dy }px)` }, { transform: 'translate(0, 0)' } ],
          { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
      flip.id = 'lang-flip';

      // Reveal animation (opacity/translateY) to freshen the UI on language change
      const reveal = items[i].animate(
          [
            { opacity: 0, transform: `translate(${ dx }px, ${ dy + 10 }px)` },
            { opacity: 1, transform: 'translate(0, 0)' },
          ],
          {
            duration: 800,
            delay: i * 40,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both',
          },
      );
      reveal.id = 'lang-reveal';
    }
  };

  return {
    get isLight() { return isLight; },
    set isLight(v) { isLight = v; },
    get mounted() { return mounted; },
    get linksEl() { return linksEl; },
    set linksEl(v) { linksEl = v; },
    get navListEl() { return navListEl; },
    set navListEl(v) { navListEl = v; },
    get controlsEl() { return controlsEl; },
    set controlsEl(v) { controlsEl = v; },
    get canScrollUp() { return canScrollUp; },
    get canScrollDown() { return canScrollDown; },
    get sections() { return linksData.sections; },
    toggleTheme,
    changeLanguage,
    warmKoreanFonts,
    updateScrollFades,
  };
}
