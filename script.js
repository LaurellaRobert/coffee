const coffeeCupImg = document.getElementById('coffeeCupImg');
const answerElement = document.getElementById('answer');
const answerContainer = document.getElementById('answerContainer');
const questionElement = document.querySelector('.question');

let fadeOutTimer = null;

// Parallax effect
const parallaxLayers = document.querySelectorAll('.parallax-layer');
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

// Time-aware coffee wisdom responses
const coffeeWisdom = {
    morning: [
        "Yes. It's before noon.!",
    ],
    afternoon: [
        "Yes. It's the middle of the day.",
    ],
    evening: [
        "Yes. You're probably going to be up late.",
    ],
    night: [
        "Yes. You're a night owl.",
    ]
};

// Get time-appropriate response
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
}

// Mouse move parallax effect
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
    mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
});

// Smooth parallax animation loop
function animateParallax() {
    // Smooth interpolation for natural movement
    currentX += (mouseX - currentX) * 0.1;
    currentY += (mouseY - currentY) * 0.1;

    // Animate background layers
    parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        const x = currentX * speed * 50;
        const y = currentY * speed * 50;

        layer.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });

    // Animate coffee cup image
    const cupSpeed = parseFloat(coffeeCupImg.getAttribute('data-speed'));
    const cupX = currentX * cupSpeed * 50;
    const cupY = currentY * cupSpeed * 50;
    coffeeCupImg.style.transform = `translate(calc(-50% + ${cupX}px), calc(-50% + ${cupY}px))`;

    requestAnimationFrame(animateParallax);
}

// Start parallax animation
animateParallax();

// Random wisdom function
function getRandomWisdom() {
    const timeOfDay = getTimeOfDay();
    const wisdomArray = coffeeWisdom[timeOfDay];
    const randomIndex = Math.floor(Math.random() * wisdomArray.length);
    return wisdomArray[randomIndex];
}

// Show answer with animation
function showAnswer() {
    // Clear any existing fade-out timer
    if (fadeOutTimer) {
        clearTimeout(fadeOutTimer);
    }

    // Add pulse animation to coffee cup
    const cupSpeed = parseFloat(coffeeCupImg.getAttribute('data-speed'));
    const cupX = currentX * cupSpeed * 50;
    const cupY = currentY * cupSpeed * 50;

    coffeeCupImg.style.transform = `translate(calc(-50% + ${cupX}px), calc(-50% + ${cupY}px)) scale(0.95)`;
    setTimeout(() => {
        coffeeCupImg.style.transform = `translate(calc(-50% + ${cupX}px), calc(-50% + ${cupY}px)) scale(1)`;
    }, 200);

    // Get random wisdom
    const wisdom = getRandomWisdom();

    // Hide current answer and question
    answerElement.classList.remove('show');
    questionElement.style.opacity = '0';

    // Show new answer after a brief delay
    setTimeout(() => {
        answerElement.textContent = wisdom;
        answerElement.classList.add('show');

        // Auto-fade out after 5 seconds
        fadeOutTimer = setTimeout(() => {
            answerElement.classList.remove('show');
            // Show question again
            setTimeout(() => {
                questionElement.style.opacity = '1';
            }, 300);
        }, 5000);
    }, 300);
}

// Create canvas for transparency detection
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let imageData = null;

// Load image data once the image is loaded
coffeeCupImg.addEventListener('load', () => {
    canvas.width = coffeeCupImg.naturalWidth;
    canvas.height = coffeeCupImg.naturalHeight;
    ctx.drawImage(coffeeCupImg, 0, 0);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
});

// If image is already loaded (cached)
if (coffeeCupImg.complete) {
    canvas.width = coffeeCupImg.naturalWidth;
    canvas.height = coffeeCupImg.naturalHeight;
    ctx.drawImage(coffeeCupImg, 0, 0);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Check if clicked pixel is transparent
function isPixelTransparent(x, y) {
    if (!imageData) return false;

    // Calculate the position in the image
    const rect = coffeeCupImg.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const imageX = Math.floor((x - rect.left) * scaleX);
    const imageY = Math.floor((y - rect.top) * scaleY);

    // Check bounds
    if (imageX < 0 || imageX >= canvas.width || imageY < 0 || imageY >= canvas.height) {
        return true; // Out of bounds = transparent
    }

    // Get pixel data
    const index = (imageY * canvas.width + imageX) * 4;
    const alpha = imageData.data[index + 3];

    // Return true if alpha is less than 10 (essentially transparent)
    return alpha < 10;
}

// Hold for 3 seconds for special animation
let holdTimer = null;
let progressTimer = null;
let isHolding = false;
let holdAnimationTriggered = false;

// Create progress bar
const progressContainer = document.createElement('div');
progressContainer.className = 'hold-progress-container';
const progressBar = document.createElement('div');
progressBar.className = 'hold-progress-bar';
progressContainer.appendChild(progressBar);
document.body.appendChild(progressContainer);

function hideProgressBar() {
    progressContainer.classList.remove('visible');
    progressBar.classList.remove('filling');
}

coffeeCupImg.addEventListener('mousedown', (e) => {
    if (imageData && isPixelTransparent(e.clientX, e.clientY)) return;

    isHolding = true;

    // Show progress bar after 1 second
    progressTimer = setTimeout(() => {
        if (isHolding) {
            // Remove any previous state
            progressBar.classList.remove('filling');

            // Show the container
            progressContainer.classList.add('visible');

            // Force reflow to ensure transition works
            void progressBar.offsetWidth;

            // Start filling animation
            setTimeout(() => {
                progressBar.classList.add('filling');
            }, 50);
        }
    }, 1000);

    // Trigger special animation after 3 seconds
    holdTimer = setTimeout(() => {
        if (isHolding) {
            // Hide progress bar
            hideProgressBar();

            // Set flag to prevent click from counting
            holdAnimationTriggered = true;

            // 10 different hold animations with equal probability
            const animations = [
                'rainbowSpin',
                'earthquakeShake',
                'pulseBeat',
                'spiralAscend',
                'colorCycle',
                'bouncyParty',
                'glitchEffect',
                'explosionBurst',
                'rotationMatrix',
                'waveDistortion'
            ];

            // Randomly select one animation (10% chance each)
            const selectedAnimation = animations[Math.floor(Math.random() * animations.length)];

            // Hide all text during animation
            questionElement.style.opacity = '0';
            answerElement.classList.remove('show');

            // Apply the selected animation to the cup only
            coffeeCupImg.style.animation = `${selectedAnimation} 2s ease`;

            setTimeout(() => {
                coffeeCupImg.style.animation = '';
                // Show question again after animation
                questionElement.style.opacity = '1';
                // Reset flag after a short delay to allow normal clicks again
                setTimeout(() => {
                    holdAnimationTriggered = false;
                }, 100);
            }, 2000);
        }
    }, 3000);
});

coffeeCupImg.addEventListener('mouseup', () => {
    clearTimeout(holdTimer);
    clearTimeout(progressTimer);
    isHolding = false;
    hideProgressBar();
});

coffeeCupImg.addEventListener('mouseleave', () => {
    clearTimeout(holdTimer);
    clearTimeout(progressTimer);
    isHolding = false;
    hideProgressBar();
});

// Coffee cup click event with transparency check
coffeeCupImg.addEventListener('click', (e) => {
    // Don't count click if hold animation was triggered
    if (holdAnimationTriggered) {
        return;
    }

    // Try transparency check if image data is available
    if (imageData) {
        if (!isPixelTransparent(e.clientX, e.clientY)) {
            showAnswer();
        }
    } else {
        // Fallback: just allow all clicks
        showAnswer();
    }
});

// Change cursor based on transparency
coffeeCupImg.addEventListener('mousemove', (e) => {
    if (imageData) {
        const transparent = isPixelTransparent(e.clientX, e.clientY);
        coffeeCupImg.style.cursor = transparent ? 'default' : 'pointer';
    } else {
        // Fallback: always show pointer
        coffeeCupImg.style.cursor = 'pointer';
    }
});

// Reset cursor when leaving the image
coffeeCupImg.addEventListener('mouseleave', () => {
    coffeeCupImg.style.cursor = 'default';
});

// Spacebar shortcut to trigger coffee cup
document.addEventListener('keydown', (e) => {
    // Spacebar triggers coffee cup
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        showAnswer();
    }

    // 'R' key resets the counter and golden cup easter egg
    if (e.key === 'r' || e.key === 'R') {
        coffeeCount = 0;
        localStorage.setItem('coffeeCount', '0');
        localStorage.removeItem('tenthClickTriggered');
        updateCounter();
        console.log('Counter and easter egg reset!');
    }
});

// Easter egg: Konami code for extra caffeine enthusiasm
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiSequence.join('')) {
        answerElement.textContent = "🎮 ULTRA MEGA COFFEE MODE ACTIVATED! ☕☕☕";
        answerElement.classList.add('show');
        document.body.style.animation = 'rainbow 2s infinite';
    }
});

// Reduce parallax effect on mobile/tablet
if (window.innerWidth <= 768) {
    parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        layer.setAttribute('data-speed', speed * 0.3); // Reduce effect by 70%
    });
}

// Particle system - Steam ripple effect
class Particle {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = Math.random() * 0.8 + 0.3; // Much slower initial speed
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed - 0.5; // Upward bias
        this.life = 1;
        this.decay = Math.random() * 0.006 + 0.008; // Varied decay rates
        this.size = Math.random() * 12 + 4; // More size variation
        this.growth = Math.random() * 0.25 + 0.15; // Varied growth
        this.wobbleSpeed = Math.random() * 0.03 + 0.01; // Slower wobble
        this.wobbleAmount = Math.random() * 2 + 1; // Gentler wobble
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.swirl = Math.random() * 0.02 - 0.01; // Add swirling motion
        this.turbulence = Math.random() * 0.3 + 0.1; // Random turbulence
        this.baseOpacity = Math.random() * 0.3 + 0.3; // Varied opacity

        // Store RGB values to construct rgba strings with dynamic alpha
        this.baseColor = Math.floor(Math.random() * 20 + 235);

        this.time = 0;
    }

    update() {
        this.time++;

        // Add turbulence (random jitter for organic feel)
        if (Math.random() < 0.1) {
            this.vx += (Math.random() - 0.5) * this.turbulence;
            this.vy += (Math.random() - 0.5) * this.turbulence * 0.5;
        }

        // Move outward and upward
        this.x += this.vx;
        this.y += this.vy;

        // Steam rises and slows down horizontally
        this.vy -= 0.03; // Gentler rise
        this.vx *= 0.985; // Slower deceleration

        // Enhanced side-to-side wobble for organic steam movement
        const wobbleX = Math.sin(this.time * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmount;
        this.x += wobbleX;

        // Add vertical wobble with different frequency
        const wobbleY = Math.cos(this.time * this.wobbleSpeed * 0.7 + this.wobbleOffset) * (this.wobbleAmount * 0.3);
        this.y += wobbleY;

        // Add swirling/curling motion
        this.vx += Math.sin(this.time * 0.02) * this.swirl;

        // Expand as it rises (like steam dissipating)
        this.size += this.growth;

        // Fade out with variation
        this.life -= this.decay;
    }

    draw(ctx) {
        // Calculate opacity
        const opacity = this.life * this.baseOpacity;

        // Stop rendering if too faint (prevents flickering at very low opacity)
        if (opacity < 0.01) return;

        // Create soft, blurred effect using multiple overlapping circles
        const blur = this.size * 0.4;

        const c1 = this.baseColor;
        const c2 = this.baseColor + 5;
        const c3 = this.baseColor + 10;

        // Outer blur layer (most diffuse) - bake alpha into color
        ctx.fillStyle = `rgba(${c1}, ${c1}, ${c1}, ${opacity * 0.2})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + blur * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Middle blur layer
        ctx.fillStyle = `rgba(${c2}, ${c2}, ${c2}, ${opacity * 0.35})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + blur, 0, Math.PI * 2);
        ctx.fill();

        // Middle-inner layer
        ctx.fillStyle = `rgba(${c3}, ${c3}, ${c3}, ${opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = `rgba(245, 245, 245, ${opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Particle canvas
const particleCanvas = document.createElement('canvas');
particleCanvas.style.position = 'fixed';
particleCanvas.style.top = '0';
particleCanvas.style.left = '0';
particleCanvas.style.width = '100%';
particleCanvas.style.height = '100%';
particleCanvas.style.pointerEvents = 'none';
particleCanvas.style.zIndex = '101';
document.body.appendChild(particleCanvas);

const particleCtx = particleCanvas.getContext('2d');
particleCanvas.width = window.innerWidth;
particleCanvas.height = window.innerHeight;

let particles = [];
let goldenParticles = [];

function createParticles(x, y, count = 20) {
    // Create particles in a circular ripple pattern
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        particles.push(new Particle(x, y, angle));
    }
}

function animateParticles() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    // Update regular steam particles
    particles = particles.filter(particle => !particle.isDead());
    particles.forEach(particle => {
        particle.update();
        particle.draw(particleCtx);
    });

    // Update golden sparkle particles
    goldenParticles = goldenParticles.filter(particle => particle.life > 0);
    goldenParticles.forEach(particle => {
        updateGoldenParticle(particle);
        drawGoldenParticle(particleCtx, particle);
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// Trigger particles on coffee cup click
const originalShowAnswer = showAnswer;
showAnswer = function() {
    const rect = coffeeCupImg.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createParticles(x, y);
    originalShowAnswer();
};

// Handle window resize
window.addEventListener('resize', () => {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
});

// Text hover to bring to front
const contentOverlay = document.querySelector('.content-overlay');

questionElement.addEventListener('mouseenter', () => {
    contentOverlay.classList.add('text-focused');
});

questionElement.addEventListener('mouseleave', () => {
    contentOverlay.classList.remove('text-focused');
});

answerElement.addEventListener('mouseenter', () => {
    contentOverlay.classList.add('text-focused');
});

answerElement.addEventListener('mouseleave', () => {
    contentOverlay.classList.remove('text-focused');
});

// Coffee decision counter
const counterElement = document.createElement('div');
counterElement.className = 'counter';
document.body.appendChild(counterElement);

// Load counter from localStorage
let coffeeCount = parseInt(localStorage.getItem('coffeeCount') || '0');

// Golden sparkle particle for 10th click
function createGoldenParticle(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 1;

    const particle = {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: Math.random() * 8 + 4,
        life: 1,
        decay: Math.random() * 0.01 + 0.015,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.2 - 0.1
    };

    return particle;
}

function updateGoldenParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy -= 0.05; // Rise
    particle.vx *= 0.98; // Slow down
    particle.life -= particle.decay;
    particle.rotation += particle.rotationSpeed;
}

function drawGoldenParticle(ctx, particle) {
    const opacity = particle.life;
    if (opacity < 0.01) return;

    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);

    // Draw sparkle as a star shape
    ctx.fillStyle = `rgba(255, 215, 0, ${opacity * 0.9})`;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * particle.size;
        const y = Math.sin(angle) * particle.size;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        // Inner point
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * (particle.size * 0.4);
        const innerY = Math.sin(innerAngle) * (particle.size * 0.4);
        ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();

    // Outer glow
    ctx.fillStyle = `rgba(255, 223, 128, ${opacity * 0.4})`;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// 10th click easter egg
function triggerTenthClickEasterEgg() {
    // Check if already triggered
    if (localStorage.getItem('tenthClickTriggered')) return;

    // Set flag
    localStorage.setItem('tenthClickTriggered', 'true');

    const rect = coffeeCupImg.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // Apply golden shimmer to main cup
    coffeeCupImg.style.animation = 'goldenShimmer 2s ease-in-out';

    // Screen center for orbiting
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    // Create 5 duplicate cups that orbit around
    const duplicates = [];
    const orbitRadius = Math.min(window.innerWidth, window.innerHeight) * 0.35; // 35% of smaller dimension

    for (let i = 0; i < 5; i++) {
        const duplicate = document.createElement('img');
        duplicate.src = 'images/coffee-cup.png';
        duplicate.className = 'duplicate-cup';

        // Start from coffee cup position
        duplicate.style.left = startX + 'px';
        duplicate.style.top = startY + 'px';

        // Add unique orbit animation with staggered start
        duplicate.style.animationDelay = `${i * 0.1}s`;

        // Store orbit data as custom properties
        const startAngle = (i * Math.PI * 2) / 5;
        duplicate.dataset.orbitIndex = i;
        duplicate.dataset.orbitRadius = orbitRadius;
        duplicate.dataset.screenCenterX = screenCenterX;
        duplicate.dataset.screenCenterY = screenCenterY;
        duplicate.dataset.startAngle = startAngle;

        document.body.appendChild(duplicate);
        duplicates.push(duplicate);
    }

    // Animate orbiting cups
    let animationStartTime = Date.now();
    const animationDuration = 3000; // 3 seconds

    function animateOrbitingCups() {
        const elapsed = Date.now() - animationStartTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        if (progress >= 1) {
            // Clean up
            coffeeCupImg.style.animation = '';
            duplicates.forEach(dup => dup.remove());
            return;
        }

        duplicates.forEach((dup, i) => {
            const orbitRadius = parseFloat(dup.dataset.orbitRadius);
            const screenCenterX = parseFloat(dup.dataset.screenCenterX);
            const screenCenterY = parseFloat(dup.dataset.screenCenterY);
            const startAngle = parseFloat(dup.dataset.startAngle);

            // Expand outward from coffee cup to orbit position
            const expandProgress = Math.min(progress * 2, 1); // First half of animation
            const currentRadius = orbitRadius * expandProgress;

            // Rotate around screen center
            const rotationSpeed = 2; // rotations per animation
            const currentAngle = startAngle + (progress * Math.PI * 2 * rotationSpeed);

            const x = screenCenterX + Math.cos(currentAngle) * currentRadius;
            const y = screenCenterY + Math.sin(currentAngle) * currentRadius;

            dup.style.left = x + 'px';
            dup.style.top = y + 'px';

            // Fade in and out
            if (progress < 0.2) {
                dup.style.opacity = progress / 0.2;
            } else if (progress > 0.8) {
                dup.style.opacity = (1 - progress) / 0.2;
            } else {
                dup.style.opacity = 1;
            }

            // Create sparkles along the path
            if (Math.random() < 0.15) {
                goldenParticles.push(createGoldenParticle(x, y));
            }
        });

        requestAnimationFrame(animateOrbitingCups);
    }

    animateOrbitingCups();

    // Create sparkles around main cup
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const sparkleX = startX + (Math.random() - 0.5) * 200;
            const sparkleY = startY + (Math.random() - 0.5) * 200;
            goldenParticles.push(createGoldenParticle(sparkleX, sparkleY));
        }, i * 40);
    }
}

// Update counter display
function updateCounter() {
    counterElement.textContent = coffeeCount;

    // Trigger easter egg at 10th click
    if (coffeeCount === 10) {
        triggerTenthClickEasterEgg();
    }
}

// Initialize counter display
updateCounter();

// Increment counter on coffee decision
const originalShowAnswerForCounter = showAnswer;
showAnswer = function() {
    coffeeCount++;
    localStorage.setItem('coffeeCount', coffeeCount);
    updateCounter();
    originalShowAnswerForCounter();
};
