addEventListener('keydown', function(event) {
  if (event.key === 'Escape' || event.key === ' ') {
    console.log('key pressed')
    const overlays = document.querySelectorAll('.o-active');
    overlays.forEach(element => {
      element.classList.remove('o-active');
      element.classList.add('o-inactive')
    });
  }
});
