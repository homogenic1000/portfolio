// projects.js - La "boîte à recettes" : configuration de tous les projets
// Ajouter un projet = ajouter une entrée ici + un sprite dans OBJECT_CONFIG (objects.js)
// dont le label Matter correspond à la clé. Le reste est automatique.

function miniRect(sprite) {
  const r = 0.55 + Math.random() * 0.5;
  const scale = 0.07 * r;
  const size = Math.round(2048 * scale);
  return { type: "rectangle", w: size, h: size, sprite, scale };
}

const PROJECTS = {
  korg: {
    title: "Korg e-LIVEsEx jewel case",
    text: "This is projet is an hommage for Nelson Weber, a great friend of mine and also a great compositor. It's a cd book and jewel case i've designed, the track name is Korg e-LIVEsEx it's mechanical, metallic, mysterious.\n\nThe inside of the cd book i've used the JetBrains Mono font face, it represent exactly the genre of the track ; nerdy, electronic, complex. It's also a great open-source type that i personally love. The clustered line is a photo of the EMX-1 that i vectorized it's a reference to how this track was made",
    bg: "#ffffff",
    color: "blue",
    media: { type: "3d", modelPath: "assets/model/cd.glb" },
    images: ["assets/2d/korg1.webp", "assets/2d/korg2.webp", "assets/2d/korg3.webp", "assets/2d/korg4.webp"],
  },

    rondpoint: {
      title: "Frip'O'Point motion design",
      text: "Frip'O'Point was an event that took place on the 23rd of August 2025. It was a temporary thrift shop organized by Rondpoint Collectif, which we founded with my friends.\n\nAt Rondpoint, there are two graphic designers and two interactive media designers, so we're really passionate about our communication. We create things and let our ideas flow into our posters and animations. \n\nThe poster was made by Marko Illic, Sophie, and me, and I did all the animation!\n\nWe wanted a poster that would convey the craftsmanship of the event, so we used Blender to create some of the letters, Play-Doh for others, and some fabric that I sewed together to create the patchwork curtain animation.",
      bg: "#ffffff",
      color: "blue",
      media: { type: "video", src: "assets/video/rondpoint.webm" },
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



  // Exemple pour un futur projet vidéo — décommenter et adapter :
  // pamplemousse: {
  //   title: "Pamplemousse",
  //   text: "Description du projet...\n\nDeuxième paragraphe...",
  //   bg: "#ffa500",
  //   media: { type: "video", src: "assets/videos/pamplemousse.mp4" },
  //   images: ["assets/2d/pamplemousse-1.webp", "assets/2d/pamplemousse-2.webp"],
  // },
};
