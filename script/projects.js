// projects.js - La "boîte à recettes" : configuration de tous les projets
// Ajouter un projet = ajouter une entrée ici + un sprite dans OBJECT_CONFIG (objects.js)
// dont le label Matter correspond à la clé. Le reste est automatique.

function miniRect(sprite) {
  return { type: "rectangle", w: 150, h: 150, sprite, scale: 0 };
}

const PROJECTS = {
  korg: {
    label: "Korg",
    title: "Korg e-LIVEsEx jewel case",
    type: "graphic design",
    date: "2024 → 2026",
    text: "This project is a tribute to Nelson Weber, a great friend of mine and a great composer. It's a CD booklet and jewel case I designed; the track name is Korg e-LIVEsEx — it's mechanical, metallic, mysterious.\n\nOn the inside of the CD booklet, I used the JetBrains Mono typeface; it represents exactly the genre of the track: nerdy, electronic, complex. It's also a great open-source typeface that I personally love. The clustered line is a photo of the EMX-1 that I vectorized — it's a reference to how this track was made.\n\nGo <a href='https://soundcloud.com/splink-splonk/korg-e-sex-live-track' target='_blank' rel='noopener noreferrer'><u>check it out</u></a>.",
    bg: "#ffffff",
    color: "#7a5f33",
    sprite: "assets/2d/korg-cd.webp",
    media: { type: "3d", modelPath: "assets/model/cd.glb" },
    images: ["assets/2d/korg1.webp", "assets/2d/korg2.webp", "assets/2d/korg3.webp", "assets/2d/korg4.webp"],
  },

  rondpoint: {
    label: "Frip'O'Point",
    title: "Frip'O'Point motion design",
    type: "motion design",
    date: "2025",
    text: "Frip'O'Point was an event that took place on the 23rd of August 2025. It was a temporary thrift shop organized by Rondpoint Collectif, that we founded with my friends.\n\nAt Rondpoint, there are two graphic designers and two interactive media designers, and we're really passionate about our communication. We create things and let our ideas flow into our posters and animations.\n\nMarko Illic, Sophie and I made the poster, and I did all the animation!\n\nWe wanted a poster that would convey the craftsmanship of the event, so we used Blender to create some of the letters, Play-Doh for others, and some fabric that I sewed together to create the patchwork curtain animation.\n\n<span class=\"copyright\">All rights to the musical composition and sound recording of \"Pro: Lov: Ad\" are owned by Sweet Trip and Darla Records (℗ © 2003). This mention is made for commentary, criticism, or reference purposes under Fair Use guidelines, and no copyright infringement is intended.</span>",
    bg: "#ffffff",
    color: "#148137",
    sprite: "assets/2d/rondpoint-projects/rondpoint.webp",
    media: { type: "video", src: "assets/video/fripopoint.webm", aspect: "842 / 1190" },
    images: [],
    minWorld: {
      gravity: 0,
      objects: [
        miniRect("assets/2d/rondpoint-projects/rondpoint.webp"),
        miniRect("assets/2d/rondpoint-projects/i.webp"),
        miniRect("assets/2d/rondpoint-projects/f2.webp"),
        miniRect("assets/2d/rondpoint-projects/p.webp"),
        miniRect("assets/2d/rondpoint-projects/i2.webp"),
        miniRect("assets/2d/rondpoint-projects/n.webp"),
        miniRect("assets/2d/rondpoint-projects/o.webp"),
        miniRect("assets/2d/rondpoint-projects/p2.webp"),
        miniRect("assets/2d/rondpoint-projects/r.webp"),
        miniRect("assets/2d/rondpoint-projects/t.webp")
      ],
    },
  },

  vroomvroom: {
    label: "vroomVROOM",
    title: "vroomVROOM motion design",
    type: "motion design",
    date: "2026",
    text: "vroomVROOM is a show that takes place at Transition Radio, a web-based radio in Fribourg. We signed up with my collective, Rondpoint. The goal is to showcase new and emerging artists. It was an EDM & free-party themed show, so we wanted something trashy for the visuals, with dithering and texture.\n\n<span class=\"copyright\">Music: \"Jimmy krunsh bedr00m : impro 2bl3ton livvv\" by Jimmy. All rights to the composition and recording belong to their respective owners. This mention is made for reference purposes under Fair Use guidelines, and no copyright infringement is intended.</span>",
    bg: "#ffffff",
    color: "#575973",
    sprite: "assets/2d/vroomvroom.webp",
    media: { type: "video", src: "assets/video/vroomvroom/vroomvroom.webm", aspect: "720 / 1280" },
    images: ["assets/video/vroomvroom/ANIM_1.webm", "assets/video/vroomvroom/NOISE DOT.webm", "assets/video/vroomvroom/RANDOM TEXT.webm"],
  },

  betweenworlds: {
    label: "Between Worlds",
    title: "Between Worlds",
    type: "datamoshing",
    date: "2026",
    text: "Between Worlds is an experimental video piece. I've always wanted to try datamoshing and blob tracking. I learned a lot about compression and video codecs, and it was such a fun process.\n\n<span class=\"copyright\">Music: \"A-Z\" by A.G. Cook. All rights to the composition and recording belong to their respective owners. This mention is made for reference purposes under Fair Use guidelines, and no copyright infringement is intended.</span>",
    bg: "#ffffff",
    color: "#6e645f",
    sprite: "assets/2d/betweenworlds.webp",
    media: { type: "video", src: "assets/video/timeline1.webm", poster: "assets/2d/betweenworlds.webp", aspect: "16 / 9" },
    images: [],
    layout: "stack",
  },

  premierjour: {
    title: "Premier jour d'été",
    text: "Premier jour d'été is a series of nature photography capturing the first day of summer. It's a project I did in collaboration with a-lea-toire.ch, a friend of mine. It was really interesting doing so much manual work — creating a composition with fruit and finding the right light.",
    bg: "#ffffff",
    color: "#946700",
    sprite: "assets/2d/pamplemousse.webp",
    media: { type: "image", images: ["assets/2d/nature.webp", "assets/2d/nature2.webp"] },
    images: ["assets/2d/img_3877.webp", "assets/2d/img_3878.webp", "assets/2d/img_3879.webp", "assets/2d/img_3881.webp", "assets/2d/img_9391.webp"],
  },

  eracom: {
    label: "eracom",
    title: "Jingle eracom motion design",
    type: "motion design",
    date: "2026",
    text: "My class was mandated to produce an official jingle for eracom — a jingle to place at the beginning of a video project, for example — and I was one of the students whose work was selected for the official jingle. I used Blender for the animation; I chose glass because it's a reference to the eracom building — a large part of its facade is made up of big glass windows. I also did all the sound design in Ableton.",
    bg: "#ffffff",
    color: "#004AAD",
    sprite: "assets/2d/eracom-projects/poster.jpg",
    media: { type: "video", src: "assets/video/jingle.webm", poster: "assets/2d/eracom-projects/poster.jpg", aspect: "16 / 9" },
    images: [],
    layout: "stack",
  },
};
