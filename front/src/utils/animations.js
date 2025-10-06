// Animation utilities for Cyber Hospital

export function initAnimations() {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons()
  }
  
  // Initialize animated background
  initAnimatedBackground()
}

export function initAnimatedBackground() {
  const canvas = document.getElementById('animated-bg')
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const particles = []
  const particleCount = 80
  const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ</>{}[]()#@$%&*+-='
  const colors = ['#ff0055', '#00ffff', '#00ff88', '#ff00ff', '#ffff00']
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.vx = (Math.random() - 0.5) * 0.5
      this.vy = (Math.random() - 0.5) * 0.5
      this.size = Math.random() * 3 + 1
      this.char = characters[Math.floor(Math.random() * characters.length)]
      this.color = colors[Math.floor(Math.random() * colors.length)]
    }
    
    update() {
      this.x += this.vx
      this.y += this.vy
      
      // Wrap around edges
      if (this.x < 0) this.x = canvas.width
      if (this.x > canvas.width) this.x = 0
      if (this.y < 0) this.y = canvas.height
      if (this.y > canvas.height) this.y = 0
    }
    
    draw() {
      ctx.fillStyle = this.color
      ctx.font = `${this.size * 8}px "Share Tech Mono", monospace`
      ctx.fillText(this.char, this.x, this.y)
    }
  }
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }
  
  // Animation loop
  function animate() {
    // Use fillRect with transparency for trailing effect
    ctx.fillStyle = 'rgba(10, 10, 30, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Update and draw particles
    particles.forEach((particle, i) => {
      particle.update()
      particle.draw()
      
      // Draw connections
      particles.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 * (1 - distance / 150)})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      })
    })
    
    requestAnimationFrame(animate)
  }
  
  animate()
  
  // Resize canvas
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
}
