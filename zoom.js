(function () {
  try {
    const targetWidth = 328;

    function applyScale() {
      const currentWidth = window.innerWidth;
      const scale = currentWidth / targetWidth;

      document.body.style.transform = `scale(${scale})`;
      document.body.style.transformOrigin = "top left";

      document.body.style.width = `${targetWidth}px`;
    }

    document.addEventListener("DOMContentLoaded", applyScale);

    window.addEventListener("resize", applyScale);

  } catch (err) {
    console.error("[Zoom] ❌ Ошибка:", err);
  }
})();
