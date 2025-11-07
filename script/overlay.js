const overlays = document.querySelectorAll('.overlay.active');


addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    overlays.forEach(element => {
      element.classList.remove('overlay.active');
      element.classList.add('overlay')
    });
  }
});
