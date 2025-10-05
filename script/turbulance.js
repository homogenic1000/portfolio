const displacement = document.getElementById("displace");

let scale = 1.0;
let increasing = true; // vrai = on monte, faux = on descend

function updateScale() {
    displacement.setAttribute("scale", scale.toFixed(1));

    if (increasing) {
        scale += 0.1;
        increasing = true
        if (scale >= 9.0) {
            scale = 9.0;
            increasing = false;
        }
    } else {
        scale -= 0.1;
        if (scale <= 1.0) {
            scale = 1.0;
            increasing = true;
        }
    }

    setTimeout(updateScale, 200); // 50ms pour la fluidité
}

updateScale();
