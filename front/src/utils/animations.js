// Animation utilities for Cyber Hospital

let isInitialized = false;
let animationFrameId = null;
let resizeHandler = null;

const LINK_DISTANCE = 150;
const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAnimations() {
  if (isInitialized) return;
  initAnimatedBackground();
}

export function initAnimatedBackground() {
  const canvas = document.getElementById('animated-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  isInitialized = true;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  // Moins de particules sur petit écran (calcul en O(n²) des liaisons, téléphones/PC modestes)
  const particleCount = window.innerWidth < 768 ? 40 : 80;
  const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ</>{}[]()#@$%&*+-=';
  const colors = ['#ff0055', '#00ffff', '#00ff88', '#ff00ff', '#ffff00'];

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 3 + 1;
      this.font = `${this.size * 8}px "Share Tech Mono", monospace`;
      this.char = characters[Math.floor(Math.random() * characters.length)];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.font = this.font;
      ctx.fillText(this.char, this.x, this.y);
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function drawFrame() {
    ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      particle.update();
      particle.draw();

      // Pas de particles.slice() ici : évitait ~80 allocations de tableau par image
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < LINK_DISTANCE_SQ) {
          const distance = Math.sqrt(distanceSq);
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 * (1 - distance / LINK_DISTANCE)})`;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    drawFrame();
    animationFrameId = requestAnimationFrame(animate);
  }

  if (prefersReducedMotion()) {
    // Mouvement réduit : une seule image statique
    drawFrame();
  } else {
    animate();
  }

  if (!resizeHandler) {
    resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!animationFrameId) drawFrame();
    };
    window.addEventListener('resize', resizeHandler);
  }
}

export function cleanupAnimations() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  isInitialized = false;
}
