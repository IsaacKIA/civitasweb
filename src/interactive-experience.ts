/**
 * Subtle, Google-calibre UI polish:
 * 1. Minimal 3px top scroll progress indicator
 * 2. Smooth scroll-reveal fade-in for cards and sections
 */
export function initInteractiveExperience(): void {
  initScrollProgressBar();
}

function initScrollProgressBar(): void {
  if (document.getElementById("civScrollProgressBar")) return;

  const barWrap = document.createElement("div");
  barWrap.id = "civScrollProgressBar";
  barWrap.className = "civ-scroll-progress-wrap";
  barWrap.setAttribute("aria-hidden", "true");
  barWrap.innerHTML = `<div class="civ-scroll-progress-fill" id="civScrollProgressFill"></div>`;
  document.body.appendChild(barWrap);

  const fill = document.getElementById("civScrollProgressFill");
  if (!fill) return;

  let ticking = false;
  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const pct =
      docHeight > 0
        ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
        : 0;
    fill.style.width = `${pct.toFixed(1)}%`;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateProgress();
}
