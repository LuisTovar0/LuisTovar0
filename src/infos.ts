export interface Ref {
  name: string,
  url: string
}

export interface Infos {
  cool: Ref[],
  music: Ref[],
  work: Ref[]
}

const infos: Infos = {
  cool: [{
    name: "The 10 MwJ Telegram channel I administrate",
    url: "https://t.me/dezmincomjesus"
  }, {
    name: "[PT] Podcast Lado a Lado",
    url: "https://instagram.com/conf.ladoalado"
  }],

  music: [{
    name: "Songs I can play on the guitar (Notion page)",
    url: "https://luistovar.notion.site/fc13d8eceb2b463cb4e0f5ababc3b374"
  }, {
    name: "Me playing the guitar on Telegram",
    url: "https://t.me/soundedbetterinmyhead/8"
  }, {
    name: "My Spotify profile",
    url: "https://open.spotify.com/user/lmbt2000"
  }, {
    name: "My YouTube music playlist",
    url: "https://youtube.com/playlist?list=PLbmRsRHldjWYyztEtWVnVmjjb2Jb6MARc"
  }, {
    name: "My YouTube instrumental music playlst",
    url: "https://youtube.com/playlist?list=PLbmRsRHldjWY8qdHklUYnhUuJlMIQYMGR"
  }],

  work: [{
    name: "My GitHub profile",
    url: "https://github.com/LuisTovar0"
  }, {
    name: "This site's repo",
    url: "https://github.com/LuisTovar0/LuisTovar0"
  }, {
    name: "The 10McJ bot (Telegram)",
    url: "https://t.me/dez_mcj_bot"
  }]
};

export default infos;