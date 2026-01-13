// handlers.js - Gestionnaires d'événements pour les clics sur les objets

/**
 * Fonction appelée lors du clic sur l'objet aboutme
 * @param {Matter.Body} body - Le corps Matter.js de l'objet cliqué
 */
function onAboutMeClick(body) {
  console.log("AboutMe cliqué!", body);
  
  const container = document.getElementById('aboutme-inactive');
  if (container) {
    container.id = 'aboutme';
  }
}
/**
 * Fonction appelée lors du clic sur l'objet pamplemousse
 * @param {Matter.Body} body - Le corps Matter.js de l'objet cliqué
 */
function onPamplemousseCick(body) {
  console.log("Pamplemousse cliqué!", body);
  const container = document.getElementById('fruits-inactive')
  if (container) {
    container.id = 'fruits'
  }
  
  
  // Insérez votre code ici pour l'action à déclencher
}
