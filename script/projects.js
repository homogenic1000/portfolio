// projects.js - La "boîte à recettes" : configuration de tous les projets
// Ajouter un projet = ajouter une entrée ici + un sprite dans OBJECT_CONFIG (objects.js)
// dont le label Matter correspond à la clé. Le reste est automatique.

const PROJECTS = {
  korg: {
    title: "Korg e-LIVEsEx jewel case",
    text: "This is projet is an hommage for Nelson Weber, a great friend of mine and also a great compositor. It's a cd book and jewel case i've designed, the track name is Korg e-LIVEsEx it's mechanical, metallic, mysterious.\n\nThe inside of the cd book i've used the JetBrains Mono font face, it represent exactly the genre of the track ; nerdy, electronic, complex. It's also a great open-source type that i personally love. The clustered line is a photo of the EMX-1 that i vectorized it's a reference to how this track was made",
    bg: "#ffffff",
    media: { type: "3d", modelPath: "assets/model/cd.glb" },
    images: ["assets/2d/korg1.webp", "assets/2d/korg2.webp", "assets/2d/korg3.webp", "assets/2d/korg4.webp"],
  },

    rondpoint: {
      title: "Frip'O'Point motion design",
      text: "yayayay",
      bg: "#ffffff",
      media: { type: "video", src: "assets/video/rondpoint.webm" },
      images: [],
      minWorld: {
        gravity: 0.8,
        objects: [
          { type: "rectangle", w: 160, h: 93, sprite: "", scale: 0.5 },
          { type: "rectangle", w: 160, h: 93, sprite: "", scale: 0.5 },
          { type: "circle", r: 40, sprite: "", scale: 0.3 },
          { type: "rectangle", w: 120, h: 80, sprite: "", scale: 0.5 },
          { type: "circle", r: 60, sprite: "", scale: 0.25 },
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
