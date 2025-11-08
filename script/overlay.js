addEventListener('keydown', function(event) {
  if (event.key === 'Escape' || event.key === ' ') {
    console.log('key pressed')
    const container = document.getElementById('o-container-active');
    if (container) {
      container.classList.remove('o-container-active');
      container.classList.add('o-container-inactive');
    }
  }
});
