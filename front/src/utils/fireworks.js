export function createFireworks(duration = 3000) {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
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
      ctx.globalAlpha = this.alpha;
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
    const particleCount = 60;
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();

      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0 || Date.now() - startTime < duration) {
      animationId = requestAnimationFrame(animate);
    } else {
      cleanup();
    }
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (canvas.parentNode) {
      document.body.removeChild(canvas);
    }
  }

  const startTime = Date.now();
  const interval = setInterval(() => {
    if (Date.now() - startTime > duration) {
      clearInterval(interval);
      return;
    }

    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.6);
    createExplosion(x, y);
  }, 200);

  animate();

  setTimeout(() => {
    clearInterval(interval);
  }, duration);
}
