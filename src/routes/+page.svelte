<main>
    <h1 class:neon={hasNeon}>
        {#if hour < 12}
            Bom dia!
        {:else if hour >= 18}
            Boa noite!
        {:else}
            Boa tarde!
        {/if}
    </h1>
    <p>Alguma coisa vai aparecer aqui, algum dia...</p>
</main>

<script>
  const hour = new Date().getHours();
  let hasNeon = true;
  const flip = () => hasNeon = !hasNeon;
  setInterval(() => {
    flip();
    setTimeout(flip, 100);
    setTimeout(flip, 160);
    setTimeout(flip, 200);
  }, 5000);
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
    color: #faf4d3;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    place-content: center;

    h1 {
      font-size: 40px;
      font-weight: bold;
    }

    p {
      font-size: 16px;
      text-shadow: 0 0 10px white;
    }
  }

  .neon {
    --neon: #D1AC00;
    text-shadow: 0 0 5px #FFF, 0 0 10px #FFF, 0 0 15px #FFF, 0 0 20px var(--neon), 0 0 30px var(--neon), 0 0 40px var(--neon), 0 0 55px var(--neon), 0 0 75px var(--neon);
  }
</style>
