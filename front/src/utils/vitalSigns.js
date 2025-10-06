// Vital Signs Monitor Animation

export function drawHeartbeat(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let offset = 0;

  function draw() {
    // Fill with slight transparency for trailing effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const baseY = canvas.height / 2;

    for (let x = 0; x < canvas.width; x++) {
      const adjustedX = (x + offset) % canvas.width;
      let y = baseY;

      // Create heartbeat pattern
      const cycle = adjustedX % 200;

      if (cycle < 10) {
        y = baseY - 5;
      } else if (cycle < 20) {
        y = baseY - 30;
      } else if (cycle < 30) {
        y = baseY + 10;
      } else if (cycle < 50) {
        y = baseY - 40;
      } else if (cycle < 60) {
        y = baseY + 5;
      } else {
        y = baseY + Math.sin(adjustedX * 0.05) * 2;
      }

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    offset += 6;
    requestAnimationFrame(draw);
  }

  draw();
}
