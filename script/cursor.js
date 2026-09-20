/* custom cursor — white dot that follows the mouse on archive.html and,
   on hovering a project row, becomes that project's Matter.js sprite.
   The dot uses mix-blend exclusion (renders as a black dot on the white page
   and inverts automatically over any content). */

(function initCursor() {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor) return;

  const sprite = document.getElementById("cursor-sprite");

  let isSpriteMode = false;
  let realActive = false;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let prevX = targetX;
  let prevY = targetY;
  let visible = false;
  let raf = null;

  const setActive = (spriteSrc) => {
    const wantsSprite = !!spriteSrc;
    if (wantsSprite === realActive && (!wantsSprite || sprite.src.endsWith(spriteSrc))) return;
    realActive = wantsSprite;
    if (wantsSprite) sprite.src = spriteSrc;
    cursor.classList.toggle("is-sprite", wantsSprite);
    isSpriteMode = wantsSprite;
  };

  const render = () => {
    if (!visible) {
      cursor.style.opacity = "0";
      raf = null;
      return;
    }
    prevX += (targetX - prevX) * 0.28;
    prevY += (targetY - prevY) * 0.28;
    cursor.style.transform = "translate(-50%, -50%) translate(" + prevX + "px," + prevY + "px)";
    cursor.style.opacity = "1";
    raf = requestAnimationFrame(render);
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  document.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!visible) {
      visible = true;
      prevX = targetX;
      prevY = targetY;
    }
    schedule();
  });

  document.addEventListener("mouseleave", () => {
    visible = false;
    schedule();
  });

  document.addEventListener("mouseenter", () => {
    visible = true;
    schedule();
  });

  document.addEventListener("mouseover", (e) => {
    const row = e.target.closest(".row");
    const spriteSrc = row && !row.classList.contains("disabled")
      ? (row.dataset.sprite || "")
      : "";
    setActive(spriteSrc);
  });

  if (typeof document.hidden !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        visible = false;
        schedule();
      }
    });
  }
})();