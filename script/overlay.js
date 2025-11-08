addEventListener('keydown', function(event) {
  if (event.key === 'Escape' || event.key === ' ') {
    console.log('key pressed')
    const container = document.getElementById('o-container-active');
    if (container) {
      container.id = 'o-container-inactive';
    }
  }
});
