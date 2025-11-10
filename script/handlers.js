// handlers.js - Gestionnaires d'événements pour les clics sur les objets

/**
 * Fonction appelée lors du clic sur l'objet aboutme
 * @param {Matter.Body} body - Le corps Matter.js de l'objet cliqué
 */
function onAboutMeClick(body) {
  console.log("AboutMe cliqué!", body);
  
  const container = document.getElementById('o-container-inactive');
  if (container) {
    container.id = 'o-container-active';
  }
}
/**
 * Fonction appelée lors du clic sur l'objet pamplemousse
 * @param {Matter.Body} body - Le corps Matter.js de l'objet cliqué
 */
function onPamplemousseCick(body) {
  console.log("Pamplemousse cliqué!", body);
  
  
  // Insérez votre code ici pour l'action à déclencher
}

/**
 * Fonction appelée lors du clic sur l'objet korg
 * @param {Matter.Body} body - Le corps Matter.js de l'objet cliqué
 */
function onKorgClick(body) {
  console.log("Korg cliqué!", body);
  
  // Insérez votre code ici pour l'action à déclencher
}
