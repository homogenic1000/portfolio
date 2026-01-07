const overlays = ['fruits', 'aboutme', 'korg'];

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' || event.key === ' ') {
    console.log('key pressed');

    overlays.forEach(element => {
      // on cherche soit l’actif soit l’inactif
      const active = document.getElementById(element);
      const inactive = document.getElementById(`${element}-inactive`);

      if (active) {
        // s’il est actif → on le désactive
        active.id = `${element}-inactive`;
      } 
    });
  }
});
