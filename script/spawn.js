function getCenter(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return { x: centerX, y: centerY };
}

const monObjet = document.getElementById('#sandwich');
const centre = getCenter(monObjet);
console.log("Centre de l'objet :", centre);