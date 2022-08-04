const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')

canvas.width = innerWidth
canvas.height = innerHeight

const fricton = 0.99

class Player {
    constructor({position, velocity, radius, color}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
    }

    drawPlayer() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor({position, velocity, radius, color}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
    }

    drawProjectile() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    updateProjectile() {
        this.drawProjectile()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Enemy {
    constructor({position, velocity, radius, color}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
    }

    drawEnemy() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    updateEnemy() {
        this.drawEnemy()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle {
    constructor({position, velocity, radius, color}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.alpha = 1
    }

    drawParticle() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    updateParticle() {
        this.drawParticle()

        this.velocity.x *= fricton
        this.velocity.y *= fricton

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width/2
const y = canvas.height/2

// Player Projectiles Enemies
const player = new Player({
    position: {x: x, y: y},
    velocity: {x: 0, y: 0},
    radius: 30,
    color: 'white'
})
const projectiles = []
const enemies = []
const particles = []

function spawnEnemy() {
    setInterval(() => {
        const radius = Math.random() * (30-10) + 10

        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0-radius : canvas.width+radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0-radius : canvas.height+radius    
        }

        const angle = Math.atan2(
            player.position.y - y,
            player.position.x - x
        )
    
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }    

        enemies.push(new Enemy({
            position: {x: x, y: y},
            velocity: velocity,
            radius: radius,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`
        }))

    }, 1000)
}

// Game
let animateId
let score = 0

function animate() {
    // Game Loop
    animateId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // Player
    player.drawPlayer()

    // Projectiles
    projectiles.forEach((each, index) => {
        each.updateProjectile()

        if (each.position.x + each.radius < 0 ||
            each.position.x + each.radius > canvas.width ||
            each.position.y + each.radius < 0 ||
            each.position.y + each.radius > canvas.height 
            ) {
                setTimeout(() => {
                    projectiles.splice(index, 1)
                }, 0)
            }
    })

    // Enemies
    enemies.forEach((eachEnemy, indexEnemy) => {
        eachEnemy.updateEnemy()

        // Player Collision with Enemy
        const dist = Math.hypot(
            player.position.x - eachEnemy.position.x,
            player.position.y - eachEnemy.position.y,
        )

        if (dist - eachEnemy.radius - player.radius < 1) {
            cancelAnimationFrame(animateId)
        }

        // Projectile Collision with Enemy
        projectiles.forEach((eachProjectile, indexProjectile) => {
            const dist = Math.hypot(
                eachProjectile.position.x - eachEnemy.position.x,
                eachProjectile.position.y - eachEnemy.position.y,
            )
            if (dist - eachEnemy.radius - eachProjectile.radius < 1) {

                for (let i=0; i<eachEnemy.radius*2; i++) {
                    particles.push(
                        new Particle({
                            position: {
                                x: eachEnemy.position.x,
                                y: eachEnemy.position.y
                            },
                            velocity: {
                                x: (Math.random() - 0.5) * (Math.random()*6),
                                y: (Math.random() - 0.5) * (Math.random()*6),
                            },
                            color: eachEnemy.color,
                            radius: Math.random() * 2
                        })
                    )                  
                }

                if (eachEnemy.radius - 10 > 10) {
                    score += 10
                    scoreEl.innerHTML = score
    
                    gsap.to(eachEnemy, {
                        radius: eachEnemy.radius-10
                    })
                    setTimeout(() => {
                        projectiles.splice(indexProjectile, 1)
                    }, 0) 
                } else {
                    score += 25
                    scoreEl.innerHTML = score
    
                    setTimeout(() => {
                        enemies.splice(indexEnemy, 1)
                        projectiles.splice(indexProjectile, 1)
                    }, 0)    
                }
                
            }
        })
    })

    // Particle
    particles.forEach((each, index) => {
        if (each.alpha <= 0) {
            setTimeout(() => {
                particles.splice(index, 1)
            }, 0) 
        } else {
            each.updateParticle()
        }
    })
}

animate()
spawnEnemy()

// On Click
// Keys
addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - player.position.y,
        event.clientX - player.position.x
    )

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(
        new Projectile({
            position: {
                x: player.position.x,
                y: player.position.y
            } ,
            velocity: velocity,
            radius: 5,
            color: 'white'
         })
    )

})

// startGameBtn.addEventListener('click', () => {
//     animate()
//     spawnEnemy()
    modalEl.style.display = 'none'
// })
