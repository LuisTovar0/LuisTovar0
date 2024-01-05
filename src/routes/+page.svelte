<main class="w-full h-full text-[#faf4d3] flex flex-col gap-0.5 items-center place-content-center">
    <h1 class="text-4xl font-bold mb-12" class:neon={hasNeon}>
        {#if hour < 12}
            Bom dia!
        {:else if hour >= 18}
            Boa noite!
        {:else}
            Boa tarde!
        {/if}
    </h1>
    <p>Alguma coisa vai aparecer aqui, algum dia...</p>
    <p>Para já, só tenho a dizer:
        {#if detect()?.os === "Android OS"}
            estás num Android
        {:else if detect()?.os === "iOS"}
            estás num iOS
        {:else}
            estás no PC
        {/if}
    </p>
</main>

<script lang="ts">
  import {detect} from "detect-browser";

  const hour = new Date().getHours();

  let hasNeon = true;
  const flip = () => hasNeon = !hasNeon;
  const flicker = () => {
    flip();
    setTimeout(flip, 100);
    setTimeout(flip, 160);
    setTimeout(flip, 240);
  };

  setTimeout(flicker, 1000);
  setInterval(flicker, 5000);
</script>

<style lang="scss">
  @font-face {
    font-family: __geistSansFont_8289af;
    src: url("https://vercel.com/_next/static/media/d82a8a076d0105b5.p.woff2") format("woff2");
    font-display: swap;
  }

  * {
    font-family: "__geistSansFont_8289af", sans-serif;
  }

  main {
    background: radial-gradient(circle, #004643 0%, #0C1618 100%);

    p {
      text-shadow: 0 0 10px white;
    }
  }

  .neon {
    --neon: #D1AC00;
    text-shadow: 0 0 5px #FFF, 0 0 10px #FFF, 0 0 15px #FFF, 0 0 20px var(--neon), 0 0 30px var(--neon), 0 0 40px var(--neon), 0 0 55px var(--neon), 0 0 75px var(--neon);
  }
</style>
