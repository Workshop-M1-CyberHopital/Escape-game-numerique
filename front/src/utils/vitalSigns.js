export function drawHeartbeat(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let x = 0;
  let animationId = null;

  const baseY = canvas.height / 2;
  const heartbeatPattern = [];

  function generateHeartbeatPattern() {
    const pattern = [];
    const cycleLength = 200;

    for (let i = 0; i < cycleLength; i++) {
      let y = 0;

      if (i < 10) {
        y = -5;
      } else if (i < 20) {
        y = -30;
      } else if (i < 30) {
        y = 10;
      } else if (i < 50) {
        y = -40;
      } else if (i < 60) {
        y = 5;
      } else {
        y = Math.sin(i * 0.05) * 2;
      }

      pattern.push(y);
    }

    return pattern;
  }

  heartbeatPattern.push(...generateHeartbeatPattern());

  function draw() {
    const currentY = baseY + heartbeatPattern[x % heartbeatPattern.length];

    if (x === 0) {
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#ff0055";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
    }

    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 2;
    ctx.lineTo(x, currentY);
    ctx.stroke();

    if (x >= canvas.width - 1) {
      ctx.clearRect(x + 1, 0, 5, canvas.height);
    }

    x += 5;

    if (x >= canvas.width) {
      x = 0;
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, currentY);
    }

    animationId = requestAnimationFrame(draw);
  }

  draw();

  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}
