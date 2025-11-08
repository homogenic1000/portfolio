function calcAge() {
  const anniversaire = new Date(2006, 5, 16); // ⚠️ Juin = 5 car janvier = 0
  const aujourdHui = new Date();

  let annees = aujourdHui.getFullYear() - anniversaire.getFullYear();
  let mois = aujourdHui.getMonth() - anniversaire.getMonth();
  let jours = aujourdHui.getDate() - anniversaire.getDate();

  // Si le jour est négatif → on emprunte un mois
  if (jours < 0) {
    mois--;
    const moisPrecedent = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 0);
    jours += moisPrecedent.getDate();
  }

  // Si le mois est négatif → on emprunte une année
  if (mois < 0) {
    annees--;
    mois += 12;
  }

  // Affiche dans la console
  console.log(`${annees} ans, ${mois} mois, ${jours} jours`);

  // Affiche dans ton HTML
  const age = document.getElementById('age');
  if (age) {
    age.textContent = `${annees}`;
  }
}

// 🔹 Appelle la fonction pour exécuter le calcul
window.addEventListener('DOMContentLoaded', calcAge);



