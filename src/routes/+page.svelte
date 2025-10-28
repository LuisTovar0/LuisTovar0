<main class="w-full h-full text-[#faf4d3] flex flex-col gap-0.5 items-center place-content-center">
    <h1 class="text-4xl font-bold mb-12" class:neon={hasNeon}>
        Luís Tovar
    </h1>
    <p>Almost there.</p>
</main>

<script lang="ts">
  let hasNeon = $state(true);
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
