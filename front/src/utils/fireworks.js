// Feu d'artifice plein écran (canvas superposé, sans interaction).
// Renvoie une fonction stop() qui arrête l'animation et retire le canvas :
// à appeler dans onUnmounted si le composant peut disparaître avant la fin.
export function createFireworks(duration = 3000) {
  if (typeof window === "undefined" || typeof document === "undefined" || !document.body) {
    return () => {};
  }

  // Respecter la préférence "réduire les animations" du système
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  document.body.appendChild(canvas);

  const MAX_PARTICLES = 900;
  const particles = [];
  const colors = [
    "#ff0055",
    "#00ffff",
    "#00ff88",
    "#ff00ff",
    "#ffff00",
    "#ff6600",
  ];
  let animationId = null;
  let intervalId = null;
  let timeoutId = null;
  let stopped = false;

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = Math.random() * 3 + 1;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      };
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.005;
      this.gravity = 0.15;
    }

    update() {
      this.velocity.y += this.gravity;
      this.velocity.x *= 0.99;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      // Une valeur hors [0, 1] serait ignorée par le canvas (la particule réapparaîtrait opaque)
      ctx.globalAlpha = Math.min(1, Math.max(0, this.alpha));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function createExplosion(x, y) {
    const particleCount = Math.min(60, MAX_PARTICLES - particles.length);
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function animate() {
    if (stopped) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.update();

      // Retirer la particule avant de la dessiner une dernière fois avec un alpha négatif
      if (particle.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      particle.draw();
    }

    if (particles.length > 0 || Date.now() - startTime < duration) {
      animationId = requestAnimationFrame(animate);
    } else {
      stop();
    }
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    if (animationId) cancelAnimationFrame(animationId);
    if (intervalId) clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
    window.removeEventListener("resize", handleResize);
    particles.length = 0;
    canvas.remove();
  }

  window.addEventListener("resize", handleResize);

  const startTime = Date.now();
  intervalId = setInterval(() => {
    if (Date.now() - startTime > duration) {
      clearInterval(intervalId);
      intervalId = null;
      return;
    }

    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.6);
    createExplosion(x, y);
  }, 200);

  animate();

  timeoutId = setTimeout(() => {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }, duration);

  return stop;
}
