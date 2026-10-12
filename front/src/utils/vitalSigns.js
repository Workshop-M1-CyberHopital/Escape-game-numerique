// Tracé ECG animé façon moniteur (onde P, complexe QRS, onde T).
// Renvoie une fonction stop() à appeler au démontage du composant.

const CYCLE_LENGTH = 200; // pixels par battement
const DEFAULT_BPM = 98; // cohérent avec l'affichage "BPM: 98"
const ERASE_GAP = 14; // zone effacée devant le tracé, comme sur un vrai moniteur
const COLOR = "#ff0055";
const BACKGROUND = "rgba(0, 0, 0, 1)";

// Interpolation linéaire entre deux points (a, va) et (b, vb)
const lerp = (i, a, va, b, vb) => va + ((vb - va) * (i - a)) / (b - a);

// Décalage vertical (en pixels, négatif = vers le haut) pour une position du cycle
function ecgOffset(position) {
  const i = ((position % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;

  if (i >= 20 && i < 40) return -6 * Math.sin((Math.PI * (i - 20)) / 20); // onde P
  if (i >= 55 && i < 60) return lerp(i, 55, 0, 60, 6); // Q
  if (i >= 60 && i < 64) return lerp(i, 60, 6, 64, -45); // montée R
  if (i >= 64 && i < 68) return lerp(i, 64, -45, 68, 12); // descente R → S
  if (i >= 68 && i < 75) return lerp(i, 68, 12, 75, 0); // retour S
  if (i >= 95 && i < 130) return -10 * Math.sin((Math.PI * (i - 95)) / 35); // onde T
  return 0; // ligne isoélectrique
}

export function drawHeartbeat(canvas, { bpm = DEFAULT_BPM } = {}) {
  if (!canvas) return () => {};

  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const width = canvas.width;
  const height = canvas.height;
  if (!(width > 0) || !(height > 0)) return () => {};
  const baseY = height / 2;
  const pixelsPerSecond = (CYCLE_LENGTH * bpm) / 60;

  let animationId = null;
  let stopped = false;
  let x = 0; // position horizontale à l'écran
  let phase = 0; // position dans le rythme (continue, même quand le tracé revient à gauche)
  let lastTime = null;

  const yAt = (position) => baseY + ecgOffset(position);

  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Animations réduites : un tracé statique suffit
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    ctx.beginPath();
    ctx.moveTo(0, yAt(0));
    for (let px = 1; px <= width; px++) ctx.lineTo(px, yAt(px));
    ctx.stroke();
    return () => {};
  }

  // Dessine le tracé de "from" à "to" (positions horizontales) pixel par pixel,
  // pour ne jamais sauter le pic du complexe QRS. "phaseFrom" = position dans le rythme en "from".
  function drawSegment(from, to, phaseFrom) {
    const at = (px) => yAt(phaseFrom + (px - from));

    // Zone effacée devant le tracé (reprise à gauche quand elle dépasse le bord droit)
    const eraseStart = from > 0 ? Math.floor(from) + 1 : 0;
    const eraseEnd = Math.ceil(to) + ERASE_GAP;
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(eraseStart, 0, eraseEnd - eraseStart, height);
    if (eraseEnd > width) ctx.fillRect(0, 0, eraseEnd - width, height);

    ctx.beginPath();
    ctx.moveTo(from, at(from));
    for (let px = Math.floor(from) + 1; px < to; px++) ctx.lineTo(px, at(px));
    ctx.lineTo(to, at(to));
    ctx.stroke();
  }

  function draw(time) {
    if (stopped) return;

    if (lastTime === null) lastTime = time;
    // Avancer selon le temps écoulé (indépendant de la fréquence de l'écran),
    // borné pour éviter un saut après un onglet resté en arrière-plan.
    const elapsed = Math.min(0.1, Math.max(0, (time - lastTime) / 1000));
    lastTime = time;

    let remaining = elapsed * pixelsPerSecond;
    while (remaining > 0) {
      const step = Math.min(remaining, width - x);
      drawSegment(x, x + step, phase);
      x += step;
      phase = (phase + step) % CYCLE_LENGTH;
      remaining -= step;
      if (x >= width) x = 0; // retour au début, le tracé précédent est effacé au fur et à mesure
    }

    animationId = requestAnimationFrame(draw);
  }

  animationId = requestAnimationFrame(draw);

  return () => {
    stopped = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
}
