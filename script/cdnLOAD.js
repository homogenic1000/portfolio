window.addEventListener('load', () => {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
  script.onload = () => startPhysics();
  document.body.appendChild(script);
});
